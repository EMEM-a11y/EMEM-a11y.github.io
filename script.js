document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1. Custom Cursor
  ========================= */

  const portfolioCursor = document.querySelector(".custom-cursor");
  const introArea = document.querySelector(".intro-inner");

  if (portfolioCursor) {
    document.body.classList.add("custom-cursor-enabled");

    document.addEventListener("mousemove", (event) => {
      portfolioCursor.style.left = event.clientX + "px";
      portfolioCursor.style.top = event.clientY + "px";
    });
  }

  if (portfolioCursor && introArea) {
    introArea.addEventListener("mouseenter", () => {
      portfolioCursor.classList.add("active");
    });

    introArea.addEventListener("mouseleave", () => {
      portfolioCursor.classList.remove("active");
    });
  }


  /* =========================
     2. Dark Mode
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
     3. Feedback Form
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
     4. Flip Cards
  ========================= */

  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
});