const NEW_PULL_REQUEST_TEMPLATE = `「{{title}}」
のPRのレビューをどうぞよろしくお願いします！

{{url}}
`;

const EDIT_PULL_REQUEST_TEMPLATE = `「{{title}}」
のPR、ご指摘箇所修正しましたので再レビューどうぞよろしくお願いします！

{{url}}
`;

class Template {
  constructor(title, text) {
    this.title = title;
    this.text = text;
    this.id = this.createId();
    this.parentId = "parent";
    this.contexts = ["selection"];
  }

  createId() {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const N = 16;
    return Array.from(Array(N))
      .map(() => S[Math.floor(Math.random() * S.length)])
      .join("");
  }
}

chrome.storage.local.get("templates", (result) => {
  if (result.templates === undefined) {
    chrome.storage.local.set({
      templates: [
        new Template("新規レビュー", NEW_PULL_REQUEST_TEMPLATE),
        new Template("再レビュー", EDIT_PULL_REQUEST_TEMPLATE),
      ],
    });
  }
});

const replaceText = (title, url, template) => {
  return template.replace("{{title}}", title).replace("{{url}}", url);
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "parent",
    title: "レビュー依頼の文章を作成する",
    contexts: ["selection"],
  });

  chrome.storage.local.get("templates", (result) => {
    const defaultTemplates = [
      new Template("新規レビュー", NEW_PULL_REQUEST_TEMPLATE),
      new Template("再レビュー", EDIT_PULL_REQUEST_TEMPLATE),
    ];

    if (result.templates === undefined) {
      chrome.storage.local.set({
        templates: defaultTemplates,
      });
      for (const template of defaultTemplates) {
        chrome.contextMenus.create({
          id: template.id,
          title: template.title,
          contexts: template.contexts,
          parentId: template.parentId,
        });
      }
    } else {
      for (const template of result.templates) {
        chrome.contextMenus.create({
          id: template.id,
          title: template.title,
          contexts: template.contexts,
          parentId: template.parentId,
        });
      }
    }
  });
});

const sendCopyText = (text) =>
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        message: "copyText",
        textToCopy: text,
      },
      function (response) {}
    );
  });

// メニューをクリック時に実行
chrome.contextMenus.onClicked.addListener((item) => {
  chrome.storage.local.get("templates", (result) => {
    const targetTemplate = result.templates.find((template) => {
      return template.id === item.menuItemId;
    });

    console.log(targetTemplate);
    sendCopyText(
      replaceText(item.selectionText, item.pageUrl, targetTemplate.text)
    );
  });
});
chrome.runtime.onMessage.addListener(function (request, _, __) {
  if (request.message == "reset") {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: "parent",
      title: "レビュー依頼の文章を作成する",
      contexts: ["selection"],
    });

    chrome.storage.local.get("templates", (result) => {
      for (const template of result.templates) {
        chrome.contextMenus.create({
          id: template.id,
          title: template.title,
          contexts: template.contexts,
          parentId: template.parentId,
        });
      }
    });
  }
});
