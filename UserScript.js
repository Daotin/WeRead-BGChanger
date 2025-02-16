// ==UserScript==
// @name         PC微信读书主题增强
// @namespace    http://tampermonkey.net/
// @version      0.4.4
// @description  修改微信读书网页版的阅读背景色
// @author       Daotin
// @match        https://weread.qq.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require https://update.greasyfork.org/scripts/526757/1538158/%E8%83%8C%E6%99%AF%E5%9B%BE%E7%89%87base64%E9%85%8D%E7%BD%AE-%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E8%84%9A%E6%9C%AC%E4%BD%BF%E7%94%A8.js
// @license MIT
// ==/UserScript==

(function () {
  "use strict";

  // 添加自定义样式
  GM_addStyle(`
        .bg-color-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px !important;
            height: 48px !important;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 16px;
            border-radius: 50%;
        }
        
        .bg-color-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .bg-color-button.dark {
            color: #666;
        }
        
        .bg-color-button.white {
            color: #fff;
        }
        
        .bg-color-button.white:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .fullscreen-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px !important;
            height: 48px !important;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 20px;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }

        .fullscreen-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .fullscreen-button.dark {
            color: #666;
        }

        .fullscreen-button.white {
            color: #fff;
        }

        .fullscreen-button.white:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .fullscreen-button.active {
            transform: rotate(180deg);
        }
        
        .bg-color-panel {
            position: absolute;
            z-index: 110;
            transition: all .2s ease-in-out;
            width: 360px;
            box-sizing: border-box;
            padding: 16px 24px;
            border-radius: 16px;
            display: none;
            box-shadow: 0 10px 50px 0 #000;
        }
        
        .bg-color-panel.dark {
            background-color: #fff;
            color: #333;
            box-shadow: 0 10px 50px 0 rgba(0,0,0,.1);
        }
        
        .bg-color-panel.white {
            background-color: #262628;
            color: #fff;
        }

        .bg-color-panel.show {
            display: block;
        }

        .bg-color-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .bg-color-option {
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: transform 0.2s;
            position: relative;
            overflow: hidden;
        }
        
        .bg-color-option:hover {
            transform: scale(1.02);
        }
        
        .bg-color-option.dark {
            color: #333;
        }
        
        .bg-color-option.white {
            color: #fff;
        }

        .bg-color-option.image {
            background-size: cover !important;
            background-position: center !important;
            color: #fff !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }

        .bg-color-option.image span {
            position: relative;
            z-index: 2;
        }

        .feedback-link {
            display: block;
            margin-top: 12px;
            text-align: center;
            font-size: 13px;
            transition: opacity 0.2s;
        }
        
        .feedback-link.dark {
            color: #999;
        }
        
        .feedback-link.dark:hover {
            text-decoration: underline;
        }
        
        .feedback-link.white {
            color: #999;
        }
        
        .feedback-link.white:hover {
            text-decoration: underline;
        }
    `);

  // 预设的背景色选项
  // 起名可以参考中国传统色：https://chinacolor.org/
  const bgColors = [
    { name: "默认", value: "#ffffff", darkValue: "#1f1f1f" },
    { name: "护眼绿", value: "#c3e0c5", darkValue: "#1a291b" },
    { name: "米汤黄", value: "#eee5d3", darkValue: "#292824" },
    { name: "胭脂红", value: "#fde6e0", darkValue: "#291f1d" },
    { name: "月白", value: "#D4E5EF", darkValue: "#111111" },
    { name: "繱犗", value: "#88BFB8", darkValue: "#241f16" },
    { name: "DeepSeek蓝", value: "#8093f1", darkValue: "#01167E" }, // #4d6bfe
    { name: "Claude橙", value: "#E0AB99", darkValue: "#5D2D1D" }, // #ab5235
    // 合并背景图片数据
    ...window.backgroundImages.map((item) => {
      return {
        name: item.name,
        type: "image",
        size: item.size,
        value: item.light,
        darkValue: item.dark || item.light,
      };
    }),
  ];

  // localStorage的key
  const STORAGE_KEY = "weread_bg_settings";

  // 保存背景色设置
  function saveBgSettings(colorIndex) {
    const settings = {
      colorIndex: colorIndex,
      isDark: isDarkMode(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // 获取保存的背景色设置
  function getSavedBgSettings() {
    const settings = localStorage.getItem(STORAGE_KEY);
    return settings ? JSON.parse(settings) : null;
  }

  // 应用背景色
  function applyBgColor(content, colorIndex, isDark) {
    if (colorIndex === -1 || colorIndex >= bgColors.length) {
      content.style.backgroundColor = "";
      content.style.backgroundImage = "";
      content.style.backgroundSize = "";
      content.style.backgroundPosition = "";
      content.style.backgroundAttachment = "";
      return;
    }

    const color = bgColors[colorIndex];
    console.log("applyBgColor==>", color, window.backgroundImages);
    const isImage = color.type === "image";

    if (isImage) {
      const imageUrl = isDark ? color.darkValue : color.value;
      content.style.backgroundColor = "";
      content.style.backgroundImage = `url(${imageUrl})`;
      content.style.backgroundSize = color.size ? color.size : "";
      content.style.backgroundPosition = "center";
      content.style.backgroundAttachment = "fixed";
    } else {
      const bgColor = isDark ? color.darkValue : color.value;
      content.style.backgroundImage = "";
      content.style.backgroundColor = bgColor;
    }
  }

  // 重置背景色为默认
  function resetBackgroundColor() {
    const content = document.querySelector(".readerChapterContent");
    if (content) {
      content.style.backgroundColor = "";
      content.style.backgroundImage = "";
      content.style.backgroundSize = "";
      content.style.backgroundPosition = "";
      content.style.backgroundAttachment = "";
    }
    saveBgSettings(-1);
  }

  // 创建背景色按钮
  function createBgColorButton() {
    const button = document.createElement("button");
    button.className = "bg-color-button readerControls_item";
    button.innerHTML = "🎨";
    button.title = "背景色";
    return button;
  }

  // 创建全屏按钮
  function createFullscreenButton() {
    const button = document.createElement("button");
    button.className = "fullscreen-button readerControls_item";
    button.innerHTML = "🔍";
    button.title = "全屏阅读";
    return button;
  }

  // 判断是否为深色模式
  function isDarkMode() {
    const darkModeButton = document.querySelector(
      ".readerControls_item.white, .readerControls_item.dark"
    );
    return darkModeButton && darkModeButton.classList.contains("white");
  }

  // 创建背景色面板
  function createBgColorPanel() {
    const panel = document.createElement("div");
    panel.className = "bg-color-panel";

    const grid = document.createElement("div");
    grid.className = "bg-color-grid";

    bgColors.forEach((color, index) => {
      const option = document.createElement("div");
      const isImage = color.type === "image";

      option.className = `bg-color-option ${isImage ? "image" : ""}`;

      if (isImage) {
        option.style.background = `url(${color.value})`;
        const span = document.createElement("span");
        span.textContent = color.name;
        option.appendChild(span);
      } else {
        option.style.backgroundColor = color.value;
        option.textContent = color.name;
      }

      option.onclick = () => {
        const content = document.querySelector(".readerChapterContent");
        if (content) {
          const isDark = isDarkMode();
          if (isImage) {
            const imageUrl = isDark ? color.darkValue : color.value;
            content.style.backgroundColor = "";
            content.style.backgroundImage = `url(${imageUrl})`;
            content.style.backgroundSize = color.size ? color.size : "";
            content.style.backgroundPosition = "center";
            content.style.backgroundAttachment = "fixed";
          } else {
            const bgColor = isDark ? color.darkValue : color.value;
            content.style.backgroundImage = "";
            content.style.backgroundColor = bgColor;
          }
          saveBgSettings(index);
        }
        panel.classList.remove("show");
      };
      grid.appendChild(option);
    });

    panel.appendChild(grid);

    // 添加反馈链接
    const feedbackLink = document.createElement("a");
    feedbackLink.className = "feedback-link";
    feedbackLink.href = "https://github.com/Daotin/WeRead-BGChanger/issues";
    feedbackLink.target = "_blank";
    feedbackLink.textContent = "都不喜欢？快来提交你的美图~";
    panel.appendChild(feedbackLink);

    return panel;
  }

  // 更新深浅色模式
  function updateTheme(button, panel) {
    const isDark = isDarkMode();

    // 获取保存的背景色设置
    const savedSettings = getSavedBgSettings();
    const content = document.querySelector(".readerChapterContent");

    if (savedSettings && content) {
      // 如果深色模式状态改变，重置背景色
      if (savedSettings.isDark !== isDark) {
        resetBackgroundColor();
      } else {
        // 应用保存的背景色
        applyBgColor(content, savedSettings.colorIndex, isDark);
      }
    } else {
      resetBackgroundColor();
    }

    // 更新按钮和面板样式
    button.className = `bg-color-button readerControls_item ${
      isDark ? "white" : "dark"
    }`;
    panel.className = `bg-color-panel ${isDark ? "white" : "dark"}`;

    // 更新反馈链接样式
    const feedbackLink = panel.querySelector(".feedback-link");
    if (feedbackLink) {
      feedbackLink.className = `feedback-link ${isDark ? "white" : "dark"}`;
    }

    // 更新选项样式
    const options = panel.querySelectorAll(".bg-color-option");
    options.forEach((option, index) => {
      const color = bgColors[index];
      const isImage = color.type === "image";

      option.className = `bg-color-option ${isImage ? "image" : ""} ${
        isDark ? "white" : "dark"
      }`;

      if (isImage) {
        option.style.background = `url(${
          isDark ? color.darkValue : color.value
        })`;
      } else {
        option.style.backgroundColor = isDark ? color.darkValue : color.value;
      }
    });
  }

  // 切换全屏状态
  function toggleFullscreen(button) {
    const content = document.querySelector(".readerChapterContent");
    if (!content) return;

    if (!document.fullscreenElement) {
      content.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      button.classList.add("active");
    } else {
      document.exitFullscreen();
      button.classList.remove("active");
    }
  }

  // 监听DOM变化,添加按钮和面板
  function init() {
    console.log("===init===");
    const targetNode = document.querySelector(".readerControls");
    if (!targetNode) return;

    const button = createBgColorButton();
    const panel = createBgColorPanel();
    const fullscreenButton = createFullscreenButton();

    // 插入到深色/浅色按钮后面
    const darkModeButton = document.querySelector(
      ".readerControls_item.white, .readerControls_item.dark"
    );
    if (darkModeButton) {
      darkModeButton.parentNode.insertBefore(
        button,
        darkModeButton.nextSibling
      );
      darkModeButton.parentNode.insertBefore(
        fullscreenButton,
        button.nextSibling
      );
      document.body.appendChild(panel);

      // 初始化主题和应用保存的背景色
      updateTheme(button, panel);

      // 监听深浅色模式切换
      const themeObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
          updateTheme(button, panel);
          const isDark = isDarkMode();
          fullscreenButton.className = `fullscreen-button readerControls_item ${
            isDark ? "white" : "dark"
          }`;
        });
      });

      themeObserver.observe(darkModeButton, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // 监听全屏状态变化
      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
          fullscreenButton.classList.remove("active");
        }
      });

      // 添加全屏按钮点击事件
      fullscreenButton.onclick = () => {
        toggleFullscreen(fullscreenButton);
      };
    }

    // 点击按钮显示/隐藏面板
    button.onclick = (e) => {
      e.stopPropagation();
      const buttonRect = button.getBoundingClientRect();
      panel.style.bottom = window.innerHeight - buttonRect.top - 48 + "px";
      panel.style.right = window.innerWidth - buttonRect.left + 34 + "px";

      // 在显示面板前更新选项的背景色
      const isDark = isDarkMode();
      const options = panel.querySelectorAll(".bg-color-option");
      options.forEach((option, index) => {
        option.style.backgroundColor = isDark
          ? bgColors[index].darkValue
          : bgColors[index].value;
      });

      panel.classList.toggle("show");
    };

    // 点击其他区域隐藏面板
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && !button.contains(e.target)) {
        panel.classList.remove("show");
      }
    });
  }

  // 监听页面变化
  const observer = new MutationObserver(() => {
    if (!document.querySelector(".bg-color-button")) {
      init();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 初始化
  init();
})();
