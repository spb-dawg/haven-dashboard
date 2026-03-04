// --- HAVEN MASTER POPUP CONTROLLER (v1.6) ---

// 1. Initialize PDF.js using the LOCAL Worker file (Privacy-First)
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');

// 2. Lifecycle: Load Persistent Identity State
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['resumeName', 'writingSample', 'stability'], (data) => {
        if (data.resumeName) document.getElementById('file-name').innerText = `Anchor: ${data.resumeName}`;
        if (data.writingSample) document.getElementById('writing-sample').value = data.writingSample;
        if (data.stability) document.getElementById('stability-pref').value = data.stability;
        
        // Check Vercel Status on Load
        checkVercelStatus();
    });
});

// 3. Pillar 1: The Historical Anchor (PDF Parsing)
document.getElementById('upload-trigger').onclick = () => document.getElementById('resume-upload').click();

document.getElementById('resume-upload').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const statusDisplay = document.getElementById('file-name');
    statusDisplay.innerText = "Analyzing Persona...";
    
    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const loadingTask = pdfjsLib.getDocument({data: typedarray});
            const pdf = await loadingTask.promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(s => s.str).join(" ");
            }

            // Heuristic: Establish Tenure Gravity (Gt)
            const years = fullText.match(/\b(20\d{2})\b/g) || [];
            const isStable = years.length > 5; 
            const anchor = isStable ? "safe-harbor" : "high-growth";

            // Automate UI Selection based on Anchor
            document.getElementById('stability-pref').value = anchor;
            statusDisplay.innerText = `Anchor Set: ${isStable ? "Sanctuary" : "Outpost"}`;

            // Save Persona to Local Storage
            chrome.storage.local.set({ 
                resumeName: file.name, 
                stability: anchor, 
                resumeText: fullText 
            });

        } catch (err) {
            console.error("Haven Engine: PDF Error", err);
            statusDisplay.innerText = "Error: Use a standard PDF";
        }
    };
    reader.readAsArrayBuffer(file);
};

// 4. Pillar 2 & 3: The Analyze Action (The Handshake)
document.getElementById('analyze-btn').onclick = async () => {
    const stability = document.getElementById('stability-pref').value;
    const writing = document.getElementById('writing-sample').value;

    // Persist Writing Sample for Moxie Engine
    chrome.storage.local.set({ writingSample: writing, stability: stability });

    const resultsArea = document.getElementById('results-area');
    const scoreDisplay = document.getElementById('score-display');
    
    resultsArea.style.display = 'block';
    scoreDisplay.innerText = "...";

    // Communicate with LinkedIn Content Script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { 
        action: "ANALYZE_JOB", 
        prefs: { stability, writing } 
    }, (response) => {
        if (response) {
            updateUI(response);
            syncToVercel(response); // Send the Signal to Ops Center
        }
    });
};

// 5. The Vercel Broadcaster
async function syncToVercel(analysis) {
    // !! REPLACE WITH YOUR ACTUAL VERCEL URL !!
    const VERCEL_URL = "https://your-project.vercel.app/api/ingest";

    try {
        const response = await fetch(VERCEL_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'IDENTITY_ANALYSIS',
                payload: {
                    score: analysis.score,
                    category: analysis.category,
                    advisement: analysis.advisement,
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (response.ok) {
            document.getElementById('ops-link').innerText = "ONLINE";
            document.getElementById('ops-link').style.color = "var(--sage)";
        }
    } catch (e) {
        document.getElementById('ops-link').innerText = "OFFLINE";
    }
}

function updateUI(data) {
    const scoreDisplay = document.getElementById('score-display');
    const categoryDisplay = document.getElementById('category-display');
    
    scoreDisplay.innerText = data.score;
    categoryDisplay.innerText = data.category;
    document.getElementById('advisement-text').innerText = data.advisement;

    // Aesthetic Shift based on Category
    const color = data.category === "Sanctuary" ? "#86a789" : "#475569";
    scoreDisplay.style.borderColor = color;
    categoryDisplay.style.color = color;
}

async function checkVercelStatus() {
    // Basic ping to ensure the Ops Center is reachable
    const statusEl = document.getElementById('ops-link');
    statusEl.innerText = "LINKING...";
}
