document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1. Dark Mode
  ========================= */

  const themeBtn = document.getElementById("themeBtn");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      if (document.body.classList.contains("dark-mode")) {
        themeBtn.textContent = "浅色模式";
      } else {
        themeBtn.textContent = "深色模式";
      }
    });
  }


  /* =========================
     2. Feedback Form
  ========================= */

  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackTip = document.getElementById("feedbackTip");

  if (feedbackForm && feedbackTip) {
    feedbackForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = feedbackForm.querySelector("button[type='submit']");
      const formData = new FormData(feedbackForm);

      submitButton.disabled = true;
      submitButton.textContent = "提交中...";
      feedbackTip.textContent = "";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          feedbackTip.textContent = "提交成功！谢谢你的反馈，我会通过邮箱收到。";
          feedbackForm.reset();
        } else {
          feedbackTip.textContent = "提交失败：" + (result.message || "请稍后再试。");
        }
      } catch (error) {
        feedbackTip.textContent = "网络异常，提交失败，请稍后再试。";
      }

      submitButton.disabled = false;
      submitButton.textContent = "提交反馈";
    });
  }
    /* =========================
     3. Flip Cards
  ========================= */

  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach((card) => {
    const toggleCard = () => {
      card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", card.classList.contains("flipped") ? "true" : "false");
    };

    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");

    card.addEventListener("click", toggleCard);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard();
      }
    });
  });


  /* =========================
     4. JD Match Tool
  ========================= */

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
      evidence: "相关经历包括 B 端产品实习、需求拆解、流程梳理、PRD 表达和产品复盘。",
      gap: "可追问：是否独立写过 PRD，如何判断需求优先级，如何定义验收标准。"
    },
    {
      label: "数据分析与指标意识",
      weight: 24,
      terms: ["数据", "分析", "excel", "sql", "指标", "口径", "清洗", "复盘", "报表", "bi", "转化"],
      evidence: "相关经历包括数据底座、指标口径、数据清洗、业务复盘和物流数据分析。",
      gap: "可追问：SQL / BI 熟练度，是否能独立完成数据提取、清洗、分析和可视化。"
    },
    {
      label: "AI 与自动化工作流",
      weight: 22,
      terms: ["ai", "aigc", "agent", "prompt", "自动化", "工作流", "大模型", "llm", "智能体", "效率"],
      evidence: "相关经历包括战败工单归因、需求处理 Agent、营销 Agent 和 AIGC 图文工作流。",
      gap: "可追问：AI 在项目中承担的具体环节、输出如何校验、如何从 demo 落到业务流程。"
    },
    {
      label: "金融与商业理解",
      weight: 16,
      terms: ["金融", "finance", "banking", "风险", "投资", "收益", "成本", "商业", "业务"],
      evidence: "教育背景体现了 Banking and Finance 训练，以及用指标解释业务问题的能力。",
      gap: "可追问：金融背景如何迁移到目标岗位的业务场景，是否做过行业或商业案例分析。"
    },
    {
      label: "运营协作与落地",
      weight: 14,
      terms: ["运营", "operation", "operations", "协作", "沟通", "推进", "sop", "反馈", "活动", "落地"],
      evidence: "相关经历包括平台运营、SOP 培训、用户反馈整理和跨角色推进。",
      gap: "可追问：跨部门推进方式、遇到阻力如何处理、复盘结果如何沉淀。"
    }
  ];

  const renderList = (target, items) => {
    target.innerHTML = "";
    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      target.appendChild(listItem);
    });
  };

  const hasTerm = (text, term) => text.includes(term.toLowerCase());

  const resetJdResult = () => {
    jdScore.textContent = "--";
    jdSummary.textContent = "粘贴 JD 后点击分析，从产品、数据、AI、金融和运营协作几个方向评估匹配度。";
    renderList(matchedKeywords, ["等待分析"]);
    renderList(gapKeywords, ["等待分析"]);
    jdPitch.textContent = "等待分析";
  };

  const analyzeJd = () => {
    const text = jdInput.value.trim().toLowerCase();

    if (!text) {
      jdScore.textContent = "0%";
      jdSummary.textContent = "请先粘贴一段岗位 JD，再查看候选人与岗位要求的匹配度。";
      renderList(matchedKeywords, ["还没有 JD 内容"]);
      renderList(gapKeywords, ["建议粘贴完整岗位职责、任职要求和加分项"]);
      jdPitch.textContent = "岗位描述越完整，分析结果越准确。";
      return;
    }

    const results = jdProfile.map((group) => {
      const matches = group.terms.filter((term) => hasTerm(text, term));
      const groupScore = matches.length ? Math.round(group.weight * Math.min(matches.length / 3, 1)) : 0;
      return { ...group, matches, groupScore };
    });

    const score = Math.min(96, results.reduce((total, group) => total + group.groupScore, 0));
    const matchedGroups = results
      .filter((group) => group.matches.length)
      .sort((a, b) => b.groupScore - a.groupScore);
    const gapGroups = results.filter((group) => !group.matches.length).slice(0, 3);

    jdScore.textContent = score + "%";

    if (score >= 75) {
      jdSummary.textContent = "匹配度较高，建议进入面试评估，重点核实项目深度、工具熟练度和可量化结果。";
    } else if (score >= 55) {
      jdSummary.textContent = "整体比较匹配，可作为面试候选人，建议重点追问岗位核心能力的实操深度。";
    } else if (score >= 35) {
      jdSummary.textContent = "存在部分匹配，建议判断岗位是否接受培养型候选人。";
    } else {
      jdSummary.textContent = "当前 JD 与主页经历匹配较弱，除非岗位方向可迁移，否则建议谨慎进入后续流程。";
    }

    renderList(
      matchedKeywords,
      matchedGroups.length
        ? matchedGroups.map((group) => `${group.label}：${group.matches.slice(0, 6).join(" / ")}`)
        : ["暂未命中明显关键词"]
    );

    renderList(
      gapKeywords,
      gapGroups.length
        ? gapGroups.map((group) => group.gap)
        : ["这份 JD 与主要能力方向高度重合，面试可重点核实项目真实性、参与深度和结果数据。"]
    );

    jdPitch.textContent = matchedGroups.length
      ? "建议面试重点关注：" + matchedGroups.slice(0, 3).map((group) => group.evidence).join(" ")
      : "建议先判断岗位是否确实需要产品、数据、AI 或金融相关背景，再决定是否进入面试。";
  };

  if (jdInput && analyzeJdBtn && clearJdBtn && jdScore && jdSummary && matchedKeywords && gapKeywords && jdPitch) {
    analyzeJdBtn.addEventListener("click", analyzeJd);

    clearJdBtn.addEventListener("click", () => {
      jdInput.value = "";
      resetJdResult();
      jdInput.focus();
    });
  }
});
