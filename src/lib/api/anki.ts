// This file contains utilities for exporting notes to Anki-compatible formats

import { Note } from '@/types';

interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: {
    Front: string;
    Back: string;
  };
  tags: string[];
}

interface AnkiDeck {
  deckName: string;
  notes: AnkiNote[];
}

// Function to convert a note to Anki format
export function noteToAnkiDeck(note: Note): AnkiDeck {
  // Create basic front/back cards
  const notes: AnkiNote[] = [];
  
  // Card 1: Title as front, content as back
  notes.push({
    deckName: "Smart Notes",
    modelName: "Basic",
    fields: {
      Front: note.title,
      Back: note.content
    },
    tags: note.tags
  });
  
  // Card 2: If there's a summary, use it as front and content as back
  if (note.summary) {
    notes.push({
      deckName: "Smart Notes",
      modelName: "Basic",
      fields: {
        Front: "Summarize the key points of " + note.title,
        Back: note.summary
      },
      tags: [...note.tags, 'summary']
    });
  }
  
  // Return the complete deck
  return {
    deckName: "Smart Notes",
    notes: notes
  };
}

// Function to export a note to Anki
export function exportNoteToAnki(note: Note): void {
  const ankiDeck = noteToAnkiDeck(note);
  
  // Create and download file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ankiDeck, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `anki_${note.title.replace(/\s+/g, '_').toLowerCase()}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Function to export multiple notes to Anki
export function exportNotesToAnki(notes: Note[]): void {
  // Combine all notes into a single deck
  const combinedDeck: AnkiDeck = {
    deckName: "Smart Notes",
    notes: []
  };
  
  notes.forEach(note => {
    const ankiDeck = noteToAnkiDeck(note);
    combinedDeck.notes.push(...ankiDeck.notes);
  });
  
  // Create and download file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(combinedDeck, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "anki_smart_notes.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
} 