const SAMPLE_PULL_REQUEST_TEMPLATE = `「{{title}}」
上にタイトルが入ります

{{url}}
上にURLが入ります
`;

class Template {
  constructor(title, text, id) {
    this.title = title;
    this.text = text;

    this.id = id;

    this.parentId = "parent";
    this.contexts = ["selection"];
  }
}

function createId() {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 16;
  return Array.from(Array(N))
    .map(() => S[Math.floor(Math.random() * S.length)])
    .join("");
}

function deleteTemplate(e) {
  chrome.storage.local.get("templates", (result) => {
    const filteredTemplates = result.templates.filter((template) => {
      return template.id !== e.target.parentNode.parentNode.id;
    });
    chrome.storage.local.set({
      templates: filteredTemplates,
    });
    e.target.parentNode.parentNode.remove();

    chrome.runtime.sendMessage({ message: "reset" });
  });
}

chrome.storage.local.get("templates", (result) => {
  const forms = document.getElementById("forms");
  for (const template of result.templates) {
    const clone = document
      .getElementById("template-form-template")
      .cloneNode(true);
    clone.id = template.id;
    clone.style.display = "";
    clone.querySelector("input").value = template.title;
    clone.querySelector("textarea").value = template.text;
    clone
      .querySelector(".delete-button")
      .addEventListener("click", deleteTemplate);

    forms.appendChild(clone);
  }
});

function createTemplate() {
  chrome.storage.local.get("templates", (result) => {
    const newTemplate = new Template(
      "新規テンプレ",
      SAMPLE_PULL_REQUEST_TEMPLATE,
      createId()
    );
    chrome.storage.local.set({
      templates: [...result.templates, newTemplate],
    });
    const clone = document
      .getElementById("template-form-template")
      .cloneNode(true);
    clone.id = newTemplate.id;
    clone.style.display = "";
    clone.querySelector("input").value = newTemplate.title;
    clone.querySelector("textarea").value = newTemplate.text;
    clone
      .querySelector(".delete-button")
      .addEventListener("click", deleteTemplate);

    forms.appendChild(clone);

    chrome.runtime.sendMessage({ message: "reset" });
  });
}

function updateTemplate() {
  const forms = document.getElementById("forms").children;
  const templates = Array.from(forms).map((form) => {
    return new Template(
      form.querySelector("input").value,
      form.querySelector("textarea").value,
      form.id
    );
  });
  chrome.storage.local.set({
    templates,
  });

  chrome.runtime.sendMessage({ message: "reset" });
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("add-button")
    .addEventListener("click", createTemplate);

  document
    .getElementById("update-button")
    .addEventListener("click", updateTemplate);
});
