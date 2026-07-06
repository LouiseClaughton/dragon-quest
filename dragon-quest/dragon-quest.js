import { Story } from "inkjs";

const response = await fetch("/dragon.ink.json");
const storyData = await response.json();

const story = new Story(storyData);
story.ResetState();

const storyDiv = document.getElementById("story");
const choicesDiv = document.getElementById("choices");

function formatChoiceText(text) {
    const parts = text.split(" ");

    const firstWord = parts[0];
    const rest = parts.slice(1).join(" ");

    return `<span class="choice-title">${firstWord}</span> ${rest}`;
}

function updateStory() {
    storyDiv.innerHTML = "";
    choicesDiv.innerHTML = "";

    let text = "";

    while (story.canContinue) {
        text += story.Continue() + "\n";
    }

    storyDiv.innerHTML = `<p>${text}</p>`;

    renderChoices();
}

function renderChoices() {
    choicesDiv.innerHTML = "";
    story.currentChoices.forEach((choice) => {
        // Class Cards
        if (choice.tags.includes("class_card")) {
            const card = document.createElement("div");
            card.className = "class-card";

            const icon = document.createElement("img");
            icon.src = getClassImage(choice.text);
            icon.className = "class-icon";

            const label = document.createElement("div");
            label.className = "class-label";
            label.textContent = choice.text;
            label.innerHTML = formatChoiceText(choice.text);

            card.appendChild(icon);
            card.appendChild(label);

            card.onclick = () => {
                story.ChooseChoiceIndex(choice.index);
                updateStory();
            };

            choicesDiv.appendChild(card);
        } else {
            const btn = document.createElement("button");
            btn.textContent = choice.text;

            btn.onclick = () => {
                story.ChooseChoiceIndex(choice.index);
                updateStory();
            };

            choicesDiv.appendChild(btn);
        }
    });
}

function getClassImage(text) {
    const t = text.toLowerCase();
    console.log(text);

    if (t.includes("fighter")) {
        return "/images/knight.png";
    }

    if (t.includes("wizard")) {
        return "/images/wizard.png";
    }

    if (t.includes("rogue")) {
        return "/images/thief.png";
    }

    if (t.includes("bard")) {
        return "/images/bard.png";
    }

    if (t.includes("druid")) {
        return "/images/druid.png";
    }

    return "/images/default.png";
}

updateStory();
