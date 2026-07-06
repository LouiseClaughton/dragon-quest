import { Story } from "inkjs";

/* =========================
    LOAD STORY
========================= */

const response = await fetch("/dragon.ink.json");
const storyData = await response.json();

const story = new Story(storyData);
story.ResetState();

/* =========================
    DOM
========================= */

const storyDiv = document.getElementById("story");
const choicesDiv = document.getElementById("choices");

/* =========================
    UI STATE
========================= */

let pendingChoice = null;
let uiMode = "story"; // "story" | "preview"

/* =========================
    STORY RENDER
========================= */

function updateStory() {
    console.log("updateStory CALLED, uiMode =", uiMode);

    if (uiMode !== "story") return;

    storyDiv.innerHTML = "";
    choicesDiv.innerHTML = "";

    let text = "";

    while (story.canContinue) {
        text += story.Continue();
    }

    storyDiv.innerHTML = `<p>${text.replace(/\n/g, "</p><p>")}</p>`;

    console.log("TEXT:", text);
    console.log("CHOICES:", story.currentChoices);

    renderChoices();
}

/* =========================
    CHOICE RENDER
========================= */

function renderChoices() {
    choicesDiv.innerHTML = "";

    const choicesContainer = document.createElement("div");
    choicesContainer.classList.add("choices-container");

    // Create stat preview screen
    const preview = document.createElement("div");
    preview.className = "class-preview";
    const confirm = document.createElement("button");
    confirm.textContent = "Confirm";
    confirm.classList.add('hidden', 'confirm');

    choicesDiv.appendChild(preview);
    choicesDiv.appendChild(confirm);

    story.currentChoices.forEach((choice) => {

        const tags = choice.tags || [];

        // CLASS CARDS
        if (tags.includes("class_card")) {
            const card = document.createElement("div");
            card.className = "class-card";

            const icon = document.createElement("img");
            icon.src = getClassImage(choice.text);
            icon.className = "class-icon";

            const label = document.createElement("div");
            label.className = "class-label";
            label.innerHTML = formatChoiceText(choice.text);

            card.appendChild(icon);
            card.appendChild(label);

            card.onclick = () => {
                document.querySelectorAll(".class-card").forEach(card => {
                    card.classList.remove("active");
                });

                card.classList.add('active');
                pendingChoice = choice;
                showClassPreview(choice);
            };

            choicesContainer.appendChild(card);
        } else {
            const btn = document.createElement("button");
            btn.textContent = choice.text;

            btn.onclick = () => {
                story.ChooseChoiceIndex(choice.index);
                updateStory();
            };

            choicesDiv.appendChild(btn);
        }

        choicesDiv.insertBefore(choicesContainer, preview);
    });
}

/* =========================
    PREVIEW SCREEN
========================= */

function showClassPreview(choice) {
    uiMode = "preview";

    const preview = document.querySelector('.class-preview');
    const confirm = document.querySelector('.confirm');

    const stats = getStats(choice.text);

    preview.innerHTML = `
        <h2>${formatChoiceText(choice.text)}</h2>
        <p class="${stats.strength > 0 ? 'positive' : stats.strength < 0 ? 'negative' : ''}">Strength: <span>${stats.strength}</span></p>
        <p class="${stats.dexterity > 0 ? 'positive' : stats.dexterity < 0 ? 'negative' : ''}">Dexterity: <span>${stats.dexterity}</span></p>
        <p class="${stats.constitution > 0 ? 'positive' : stats.constitution < 0 ? 'negative' : ''}">Constitution: <span>${stats.constitution}</span></p>
        <p class="${stats.wisdom > 0 ? 'positive' : stats.wisdom < 0 ? 'negative' : ''}">Wisdom: <span>${stats.wisdom}</span></p>
        <p class="${stats.intelligence > 0 ? 'positive' : stats.intelligence < 0 ? 'negative' : ''}">Intelligence: <span>${stats.intelligence}</span></p>
        <p class="${stats.charisma > 0 ? 'positive' : stats.charisma < 0 ? 'negative' : ''}">Charisma: <span>${stats.charisma}</span></p>
    `;

    confirm.classList.remove("hidden");

    confirm.onclick = () => {
        story.ChooseChoiceIndex(pendingChoice.index);
        pendingChoice = null;
        uiMode = "story";
        updateStory();
    };
}

/* =========================
    HELPERS
========================= */

function formatChoiceText(text) {
    const parts = text.split(" ");
    const firstWord = parts[0];
    const rest = parts.slice(1).join(" ");

    return `<span class="choice-title">${firstWord}</span> <span class="choice-description">${rest}</span>`;
}

function getClassImage(text) {
    const classText = text.toLowerCase();

    if (classText.includes("fighter")) return "/images/knight.png";
    if (classText.includes("wizard")) return "/images/wizard.png";
    if (classText.includes("rogue")) return "/images/thief.png";
    if (classText.includes("bard")) return "/images/bard.png";
    if (classText.includes("druid")) return "/images/druid.png";

    return "/images/default.png";
}

function getStats(text) {
    const classText = text.toLowerCase();
    let strength = 0;
    let dexterity = 0;
    let constitution = 0;
    let wisdom = 0;
    let intelligence = 0;
    let charisma = 0;

    if (classText.includes("fighter")) {
        strength = 2;
        constitution = 1;
        intelligence = -1;
    } else if (classText.includes("wizard")) {
        intelligence = 2;
        wisdom = 1;
        constitution = -1;
    } else if (classText.includes("rogue")) {
        dexterity = 2;
        charisma = 1;
        strength = -1;
    } else if (classText.includes("bard")) {
        charisma = 2;
        dexterity = 1;
        strength = -1;
    } else if (classText.includes("druid")) {
        wisdom = 2;
        constitution = 1;
        charisma = -1;
    }

    return {
        strength,
        dexterity,
        constitution,
        wisdom,
        intelligence,
        charisma
    };
}

/* =========================
    START
========================= */

updateStory();