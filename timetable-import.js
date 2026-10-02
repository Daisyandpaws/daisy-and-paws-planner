// ============================================================
// DAISY & PAWS — SAFE WORD TIMETABLE IMPORTER
// Preview only: this file does NOT change saved timetable data.
// ============================================================

(function () {
  "use strict";

  const DAYS = {
    MON: "Monday",
    MONDAY: "Monday",

    TUE: "Tuesday",
    TUES: "Tuesday",
    TUESDAY: "Tuesday",

    WED: "Wednesday",
    WEDS: "Wednesday",
    WEDNESDAY: "Wednesday",

    THU: "Thursday",
    THUR: "Thursday",
    THURS: "Thursday",
    THURSDAY: "Thursday",

    FRI: "Friday",
    FRIDAY: "Friday"
  };

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  function cleanText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normaliseHeading(value) {
    return cleanText(value)
      .toUpperCase()
      .replace(/[.:]/g, "")
      .trim();
  }

  function getDay(value) {
    return DAYS[normaliseHeading(value)] || null;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function detectDocumentInfo(text) {
    const classMatch = text.match(
      /\bClass\s*[:\-]?\s*([A-Za-z0-9.]+)/i
    );

    const termMatch = text.match(
      /\bTerm\s*[:\-]?\s*(\d+)/i
    );

    const weekMatch = text.match(
      /\bWeek\s*[:\-]?\s*(\d+)/i
    );

    const className = classMatch ? classMatch[1] : "";
    const term = termMatch ? termMatch[1] : "";
    const week = weekMatch ? weekMatch[1] : "";

    // Example: Class 2.3 -> Year 2
    let yearGroup = "";

    const yearFromClass = className.match(/^(\d+)/);

    if (yearFromClass) {
      yearGroup = "Year " + yearFromClass[1];
    }

    return {
      className,
      term,
      week,
      yearGroup
    };
  }

  // ----------------------------------------------------------
  // Extract text from a Word table cell
  // ----------------------------------------------------------

  function getCellText(cell) {
    const paragraphs = [
      ...cell.getElementsByTagNameNS("*", "p")
    ];

    const parts = paragraphs.map(paragraph => {
      const nodes = [
        ...paragraph.getElementsByTagNameNS("*", "t")
      ];

      return cleanText(
        nodes.map(node => node.textContent || "").join(" ")
      );
    }).filter(Boolean);

    return parts.join(" | ");
  }

  // ----------------------------------------------------------
  // Read every Word table
  // ----------------------------------------------------------

  function extractTables(xml) {
    const tables = [
      ...xml.getElementsByTagNameNS("*", "tbl")
    ];

    return tables.map(table => {
      const rows = [
        ...table.getElementsByTagNameNS("*", "tr")
      ];

      return rows.map(row => {
        const cells = [
          ...row.children
        ].filter(node => node.localName === "tc");

        return cells.map(getCellText);
      });
    });
  }

  // ----------------------------------------------------------
  // METHOD 1:
  // Timetable with weekdays across the top
  // ----------------------------------------------------------

  function extractColumnStyle(table) {
    const sessions = [];

    let bestHeader = null;
    let bestDays = {};

    table.forEach((row, rowIndex) => {
      const found = {};

      row.forEach((cell, columnIndex) => {
        const day = getDay(cell);

        if (day) {
          found[day] = columnIndex;
        }
      });

      if (
        Object.keys(found).length >
        Object.keys(bestDays).length
      ) {
        bestHeader = rowIndex;
        bestDays = found;
      }
    });

    if (
      bestHeader === null ||
      Object.keys(bestDays).length < 3
    ) {
      return sessions;
    }

    for (
      let rowIndex = bestHeader + 1;
      rowIndex < table.length;
      rowIndex++
    ) {
      const row = table[rowIndex];

      Object.entries(bestDays).forEach(
        ([day, columnIndex]) => {

          const text = cleanText(row[columnIndex]);

          if (!text) return;
          if (getDay(text)) return;

          sessions.push({
            day,
            text,
            source: "column"
          });
        }
      );
    }

    return sessions;
  }

  // ----------------------------------------------------------
  // METHOD 2:
  // Timetable containing separate MON / TUES / WEDS sections
  // ----------------------------------------------------------

  function extractSectionStyleFromText(text) {
    const sessions = [];

    const dayPattern =
      /\b(MONDAY|MON|TUESDAY|TUES|TUE|WEDNESDAY|WEDS|WED|THURSDAY|THURS|THUR|THU|FRIDAY|FRI)\b/gi;

    const matches = [
      ...text.matchAll(dayPattern)
    ];

    if (matches.length < 3) {
      return sessions;
    }

    matches.forEach((match, index) => {
      const day = getDay(match[0]);

      if (!day) return;

      const start =
        match.index + match[0].length;

      const end =
        index + 1 < matches.length
          ? matches[index + 1].index
          : text.length;

      const section = text
        .slice(start, end)
        .replace(/\s+/g, " ")
        .trim();

      if (!section) return;

      sessions.push({
        day,
        text: section,
        source: "section"
      });
    });

    return sessions;
  }

  // ----------------------------------------------------------
  // METHOD 3:
  // Find weekday headings inside individual Word cells
  // ----------------------------------------------------------

  function extractCellSectionStyle(tables) {
    const sessions = [];

    tables.forEach(table => {
      let currentDay = null;

      table.forEach(row => {
        row.forEach(cell => {
          const text = cleanText(cell);

          if (!text) return;

          const exactDay = getDay(text);

          if (exactDay) {
            currentDay = exactDay;
            return;
          }

          // Sometimes a cell contains MON plus another item.
          const firstWord = text
            .split(/\s+/)[0]
            .replace(/[.:]/g, "");

          const firstWordDay = getDay(firstWord);

          if (firstWordDay) {
            currentDay = firstWordDay;

            const remaining = cleanText(
              text.substring(firstWord.length)
            );

            if (remaining) {
              sessions.push({
                day: currentDay,
                text: remaining,
                source: "cell-section"
              });
            }

            return;
          }

          if (currentDay) {
            sessions.push({
              day: currentDay,
              text,
              source: "cell-section"
            });
          }
        });
      });
    });

    return sessions;
  }

  // ----------------------------------------------------------
  // Choose the most useful interpretation
  // ----------------------------------------------------------

  function analyseTimetable(xml, fullText) {
    const tables = extractTables(xml);

    let sessions = [];

    // First try a normal weekday-column timetable.
    tables.forEach(table => {
      const result = extractColumnStyle(table);

      if (result.length > sessions.length) {
        sessions = result;
      }
    });

    // Then try weekday sections stored in Word cells.
    if (!sessions.length) {
      sessions = extractCellSectionStyle(tables);
    }

    // Finally try headings in the flattened document text.
    if (!sessions.length) {
      sessions = extractSectionStyleFromText(fullText);
    }

    return {
      tables,
      sessions
    };
  }

  // ----------------------------------------------------------
  // Group recognised content by weekday
  // ----------------------------------------------------------

  function groupByDay(sessions) {
    const result = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    sessions.forEach(session => {
      if (!result[session.day]) return;

      const text = cleanText(session.text);

      if (!text) return;

      result[session.day].push(text);
    });

    return result;
  }

  // ----------------------------------------------------------
  // Preview window
  // ----------------------------------------------------------

  function showPreview(file, info, sessions) {
    document
      .getElementById("dpTimetableImportPreview")
      ?.remove();

    const grouped = groupByDay(sessions);

    const overlay = document.createElement("div");

    overlay.id = "dpTimetableImportPreview";

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.45);
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    `;

    const card = document.createElement("div");

    card.style.cssText = `
      width:min(1000px,96vw);
      max-height:90vh;
      overflow:auto;
      background:white;
      border-radius:22px;
      padding:24px;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      font-family:inherit;
    `;

    const details = [];

    if (info.yearGroup) {
      details.push(info.yearGroup);
    }

    if (info.className) {
      details.push("Class " + info.className);
    }

    if (info.term) {
      details.push("Term " + info.term);
    }

    if (info.week) {
      details.push("Week " + info.week);
    }

    const dayCards = Object.entries(grouped)
      .map(([day, entries]) => {

        const unique = [
          ...new Set(entries)
        ];

        const content = unique.length
          ? unique.map(entry => `
              <div style="
                padding:8px 0;
                border-bottom:1px solid #eee;
                line-height:1.4;
              ">
                ${escapeHtml(entry)}
              </div>
            `).join("")
          : `
              <div style="
                color:#777;
                padding:10px 0;
              ">
                Nothing confidently detected
              </div>
            `;

        return `
          <div style="
            border:1px solid #e6e6e6;
            border-radius:16px;
            padding:14px;
            min-width:0;
          ">
            <h3 style="margin:0 0 8px;">
              ${escapeHtml(day)}
            </h3>
            ${content}
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
        gap:20px;
        align-items:flex-start;
      ">
        <div>
          <h2 style="margin:0 0 6px;">
            Timetable preview 🌼
          </h2>

          <div style="color:#666;">
            ${escapeHtml(file.name)}
          </div>

          <div style="
            margin-top:6px;
            font-weight:700;
          ">
            ${
              details.length
                ? escapeHtml(details.join(" · "))
                : "Document details not confidently detected"
            }
          </div>
        </div>

        <button
          type="button"
          id="dpCloseTimetablePreview"
          style="
            border:0;
            background:#f3f3f3;
            border-radius:999px;
            padding:10px 14px;
            cursor:pointer;
          "
        >
          ✕ Close
        </button>
      </div>

      <div style="
        margin:18px 0;
        padding:12px 14px;
        background:#fff8dc;
        border-radius:12px;
      ">
        <strong>Preview only.</strong>
        Nothing has been added to your saved timetable.
      </div>

      <div style="
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(170px,1fr));
        gap:12px;
      ">
        ${dayCards}
      </div>

      <div style="
  margin-top:20px;
  color:#666;
  font-size:.92rem;
">
  Daisy & Paws found
  <strong>${sessions.length}</strong>
  timetable sections/entries.
</div>

<div style="
  margin-top:18px;
  display:flex;
  justify-content:flex-end;
  gap:10px;
">
  <button
    type="button"
    id="dpImportTimetableConfirm"
    style="
      border:0;
      border-radius:999px;
      padding:13px 22px;
      background:#b8c4a5;
      color:white;
      font-weight:700;
      font-size:1rem;
      cursor:pointer;
    "
  >
    Add to my timetable 🌼
  </button>
</div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    card
      .querySelector("#dpCloseTimetablePreview")
      .addEventListener("click", close);

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        close();
      }
    });

    // Keep this available for the future confirmation stage.
    window.DP_LAST_TIMETABLE_IMPORT_PREVIEW = {
      fileName: file.name,
      ...info,
      sessions,
      grouped
    };
  }

  // ----------------------------------------------------------
  // Read uploaded .docx
  // ----------------------------------------------------------

  async function analyseWordTimetable(file) {
    try {
      if (typeof JSZip === "undefined") {
        alert(
          "The Word document reader is not available. " +
          "Nothing has been changed."
        );
        return;
      }

      const buffer = await file.arrayBuffer();

      const zip = await JSZip.loadAsync(buffer);

      const documentFile =
        zip.file("word/document.xml");

      if (!documentFile) {
        alert(
          "Daisy & Paws could not find the Word document " +
          "content. Nothing has been changed."
        );
        return;
      }

      const xmlText =
        await documentFile.async("string");

      const parser = new DOMParser();

      const xml = parser.parseFromString(
        xmlText,
        "application/xml"
      );

      const textNodes = [
        ...xml.getElementsByTagNameNS("*", "t")
      ];

      const fullText = cleanText(
        textNodes
          .map(node => node.textContent || "")
          .join(" ")
      );

      const info =
        detectDocumentInfo(fullText);

      const analysis =
        analyseTimetable(xml, fullText);

      if (!analysis.sessions.length) {
        alert(
          "Daisy & Paws opened the Word document, but " +
          "could not confidently recognise the timetable " +
          "layout yet. Nothing has been changed."
        );
        return;
      }

      showPreview(
        file,
        info,
        analysis.sessions
      );

    } catch (error) {
      console.error(
        "Daisy & Paws timetable import:",
        error
      );

      alert(
        "Daisy & Paws could not read that timetable. " +
        "Nothing has been changed."
      );
    }
  }

  // ----------------------------------------------------------
  // Add Upload Timetable button to existing timetable page
  // ----------------------------------------------------------

  function installTimetableImporter() {
    const grid =
      document.getElementById("timetableGrid");

    if (!grid) return;

    if (
      document.getElementById(
        "dpSafeTimetableUploadButton"
      )
    ) {
      return;
    }

    const controls =
      document.createElement("div");

    controls.style.cssText = `
      display:flex;
      gap:10px;
      align-items:center;
      flex-wrap:wrap;
      margin:0 0 16px;
    `;

    const button =
      document.createElement("button");

    button.type = "button";
    button.id =
      "dpSafeTimetableUploadButton";
    button.className = "secondary";
    button.textContent =
      "🌼 Upload timetable";

    const input =
      document.createElement("input");

    input.type = "file";
    input.accept = ".docx";
    input.style.display = "none";

    button.addEventListener(
      "click",
      () => input.click()
    );

    input.addEventListener(
      "change",
      async () => {

        const file =
          input.files &&
          input.files[0];

        if (!file) return;

        if (
          !file.name
            .toLowerCase()
            .endsWith(".docx")
        ) {
          alert(
            "For this first version, please choose " +
            "a Word .docx timetable."
          );

          input.value = "";
          return;
        }

        await analyseWordTimetable(file);

        input.value = "";
      }
    );

    controls.appendChild(button);
    controls.appendChild(input);

    grid.parentNode.insertBefore(
      controls,
      grid
    );
  }

  // Install after the main Daisy & Paws script has loaded.
  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      installTimetableImporter
    );
  } else {
    installTimetableImporter();
  }

})();
