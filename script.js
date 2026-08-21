document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Theme */
  const themeBtn = document.getElementById("themeBtn");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "亮色" : "深色";
      themeBtn.setAttribute("aria-label", theme === "dark" ? "切换到亮色模式" : "切换到深色模式");
    }
  };

  setTheme(localStorage.getItem("portfolio-theme-v3") || "dark");

  themeBtn?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme-v3", nextTheme);
    setTheme(nextTheme);
  });

  /* Mobile navigation */
  const menuBtn = document.getElementById("menuBtn");
  const siteNav = document.getElementById("siteNav");

  const closeMenu = () => {
    if (!menuBtn || !siteNav) return;
    siteNav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  if (menuBtn && siteNav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  /* Animated text and entry motion */
  const animatedText = document.querySelector("[data-animated-text]");
  if (animatedText) {
    const content = animatedText.textContent.trim();
    animatedText.textContent = "";
    Array.from(content).forEach((character, index) => {
      const span = document.createElement("span");
      span.textContent = character === " " ? "\u00a0" : character;
      span.style.setProperty("--char-index", index);
      animatedText.append(span);
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  const textItems = document.querySelectorAll("[data-animated-text]");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    textItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -5% 0px" });

    [...revealItems, ...textItems].forEach((item) => revealObserver.observe(item));
  }

  const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a[href^='#']")) : [];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-24% 0px -58% 0px", threshold: [0.05, 0.25, 0.5] });

    navSections.forEach((section) => navObserver.observe(section));
  }

  /* Portrait magnet and eye tracking */
  const heroPortrait = document.getElementById("heroPortrait");
  const portraitMagnet = heroPortrait?.querySelector(".portrait-magnet");
  const pupils = heroPortrait?.querySelectorAll(".character-eye i") || [];

  const resetPortrait = () => {
    portraitMagnet?.style.setProperty("transform", "translate3d(0, 0, 0)");
    pupils.forEach((pupil) => {
      pupil.style.setProperty("--eye-x", "0px");
      pupil.style.setProperty("--eye-y", "0px");
    });
  };

  if (heroPortrait && portraitMagnet && pupils.length && !reduceMotion.matches) {
    heroPortrait.addEventListener("pointermove", (event) => {
      const bounds = heroPortrait.getBoundingClientRect();
      const xRatio = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const yRatio = ((event.clientY - bounds.top) / bounds.height - 0.45) * 2;
      const magnetX = Math.max(-10, Math.min(10, xRatio * 10));
      const magnetY = Math.max(-7, Math.min(7, yRatio * 7));
      const eyeX = Math.max(-2.3, Math.min(2.3, xRatio * 2.3));
      const eyeY = Math.max(-1.7, Math.min(1.7, yRatio * 1.7));

      portraitMagnet.style.setProperty("transform", `translate3d(${magnetX}px, ${magnetY}px, 0)`);
      pupils.forEach((pupil) => {
        pupil.style.setProperty("--eye-x", `${eyeX}px`);
        pupil.style.setProperty("--eye-y", `${eyeY}px`);
      });
    });

    heroPortrait.addEventListener("pointerleave", resetPortrait);
  }

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches) resetPortrait();
  });

  /* JD dialog */
  const jdDialog = document.getElementById("jdDialog");
  const openJdButtons = document.querySelectorAll("[data-open-jd]");
  const closeJdBtn = document.getElementById("closeJdBtn");

  if (jdDialog && openJdButtons.length && closeJdBtn) {
    openJdButtons.forEach((button) => button.addEventListener("click", () => {
      closeMenu();
      jdDialog.showModal();
    }));
    closeJdBtn.addEventListener("click", () => jdDialog.close());
    jdDialog.addEventListener("click", (event) => {
      if (event.target === jdDialog) jdDialog.close();
    });
  }

  const jdInput = document.getElementById("jdInput");
  const analyzeJdBtn = document.getElementById("analyzeJdBtn");
  const clearJdBtn = document.getElementById("clearJdBtn");
  const jdScore = document.getElementById("jdScore");
  const jdSummary = document.getElementById("jdSummary");
  const matchedKeywords = document.getElementById("matchedKeywords");
  const gapKeywords = document.getElementById("gapKeywords");
  const jdPitch = document.getElementById("jdPitch");

  const jdProfile = [
    {
      label: "产品与需求分析",
      weight: 24,
      terms: ["产品", "prd", "需求", "原型", "流程", "用户", "竞品", "b端", "b 端", "验收", "项目管理"],
      evidence: "B 端产品实习覆盖业务调研、需求拆解、产品方案、规则设计和上线迭代。",
      gap: "可追问是否独立写过 PRD，如何判断优先级与定义验收标准。"
    },
    {
      label: "数据分析与指标意识",
      weight: 24,
      terms: ["数据", "分析", "excel", "sql", "指标", "口径", "清洗", "复盘", "报表", "bi", "转化"],
      evidence: "项目中处理过报表口径、字段映射、数据链路、转化复盘和端到端核验。",
      gap: "可追问 SQL 与 BI 的熟练度，以及独立提取、清洗和解释数据的深度。"
    },
    {
      label: "AI 与自动化工作流",
      weight: 22,
      terms: ["ai", "aigc", "agent", "prompt", "自动化", "工作流", "大模型", "llm", "智能体", "效率"],
      evidence: "做过财务月报 Agent、工单质检自动化和二手车战败归因，并参与业务接入与迭代。",
      gap: "可追问 AI 负责的具体环节、输出校验方式与从验证到产品化的过程。"
    },
    {
      label: "金融与商业理解",
      weight: 16,
      terms: ["金融", "finance", "banking", "风险", "投资", "收益", "成本", "商业", "业务"],
      evidence: "Banking and Finance 学习背景支持从指标、风险、成本和商业目标理解问题。",
      gap: "可追问金融训练如何迁移到目标岗位的具体业务场景。"
    },
    {
      label: "协作与落地",
      weight: 14,
      terms: ["运营", "operation", "operations", "协作", "沟通", "推进", "sop", "反馈", "培训", "落地"],
      evidence: "经历包括跨业务与研发推进、生产环境接入、业务培训、反馈收集和规则治理。",
      gap: "可追问跨团队推进方式、阻力处理和复盘沉淀。"
    }
  ];

  const renderList = (target, items) => {
    if (!target) return;
    target.replaceChildren(...items.map((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      return listItem;
    }));
  };

  const resetJdResult = () => {
    if (!jdScore || !jdSummary || !jdPitch) return;
    jdScore.textContent = "--";
    jdSummary.textContent = "粘贴 JD 后，可以从产品、数据、AI、金融和协作方向查看匹配情况。";
    renderList(matchedKeywords, ["等待分析"]);
    renderList(gapKeywords, ["等待分析"]);
    jdPitch.textContent = "等待分析";
  };

  const analyzeJd = () => {
    if (!jdInput || !jdScore || !jdSummary || !jdPitch) return;
    const text = jdInput.value.trim().toLowerCase();

    if (!text) {
      jdScore.textContent = "0%";
      jdSummary.textContent = "请先粘贴岗位 JD。";
      renderList(matchedKeywords, ["还没有可分析的内容"]);
      renderList(gapKeywords, ["建议包含岗位职责、任职要求和加分项"]);
      jdPitch.textContent = "岗位描述越完整，结果越有参考价值。";
      return;
    }

    const results = jdProfile.map((group) => {
      const matches = group.terms.filter((term) => text.includes(term));
      const groupScore = matches.length ? Math.round(group.weight * Math.min(matches.length / 3, 1)) : 0;
      return { ...group, matches, groupScore };
    });

    const score = Math.min(96, results.reduce((total, group) => total + group.groupScore, 0));
    const matchedGroups = results.filter((group) => group.matches.length).sort((a, b) => b.groupScore - a.groupScore);
    const gapGroups = results.filter((group) => !group.matches.length).slice(0, 3);

    jdScore.textContent = `${score}%`;
    if (score >= 75) jdSummary.textContent = "匹配度较高，建议面试核实项目深度、工具熟练度和结果数据。";
    else if (score >= 55) jdSummary.textContent = "整体比较匹配，建议重点追问核心能力的实操深度。";
    else if (score >= 35) jdSummary.textContent = "存在部分匹配，可以结合岗位培养空间进一步判断。";
    else jdSummary.textContent = "当前 JD 与主页经历匹配较弱，建议先判断能力是否可以迁移。";

    renderList(matchedKeywords, matchedGroups.length
      ? matchedGroups.map((group) => `${group.label}：${group.matches.slice(0, 6).join(" / ")}`)
      : ["暂未命中明显关键词"]);

    renderList(gapKeywords, gapGroups.length
      ? gapGroups.map((group) => group.gap)
      : ["能力方向重合度较高，可重点核实项目真实性、参与深度和结果数据。"]);

    jdPitch.textContent = matchedGroups.length
      ? `建议面试重点关注：${matchedGroups.slice(0, 3).map((group) => group.evidence).join(" ")}`
      : "建议先判断岗位是否需要产品、数据、AI 或金融相关背景。";
  };

  if (jdInput && analyzeJdBtn && clearJdBtn) {
    analyzeJdBtn.addEventListener("click", analyzeJd);
    clearJdBtn.addEventListener("click", () => {
      jdInput.value = "";
      resetJdResult();
      jdInput.focus();
    });
  }

  /* Feedback form */
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackTip = document.getElementById("feedbackTip");

  if (feedbackForm && feedbackTip) {
    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = feedbackForm.querySelector("button[type='submit']");
      const formData = new FormData(feedbackForm);

      submitButton.disabled = true;
      submitButton.textContent = "提交中";
      feedbackTip.textContent = "正在发送，请稍候。";
      feedbackTip.dataset.state = "loading";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.message || "提交失败");
        feedbackTip.textContent = "已收到，谢谢你的留言。";
        feedbackTip.dataset.state = "success";
        feedbackForm.reset();
      } catch (error) {
        feedbackTip.textContent = "暂时没有发送成功，请稍后重试或直接发邮件。";
        feedbackTip.dataset.state = "error";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "提交留言";
      }
    });
  }
});
