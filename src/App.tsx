import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";

import financeVisual from "../images/project-finance-real-cover.jpg";
import financeDualTrackVisual from "../images/project-finance-real-dual-track.jpg";
import qualityVisual from "../images/project-quality-3d.jpg";
import attributionVisual from "../images/project-attribution-3d.jpg";
import tripExperienceVisual from "../images/experience-trip.jpg";
import dongchediExperienceVisual from "../images/experience-dongchedi.jpg";
import springCharacter from "../images/toonhub/spring-character.png";
import summerCharacter from "../images/toonhub/summer-character.png";
import autumnCharacter from "../images/toonhub/autumn-character.png";
import winterCharacter from "../images/toonhub/winter-character.png";
import contactCharacter from "../images/about-computer-character-half-white-v4.png";
import jobStoryOne from "../images/job-story/scene-01-campus.png";
import jobStoryTwo from "../images/job-story/scene-02-social-feed.png";
import jobStoryThree from "../images/job-story/scene-03-resume.png";
import jobStoryFour from "../images/job-story/scene-04-interview.png";
import jobStoryFive from "../images/job-story/scene-05-rejections.png";
import jobStorySix from "../images/job-story/scene-06-opportunity.png";
import jobStorySeven from "../images/job-story/scene-07-new-city.png";
import jobStoryEight from "../images/job-story/scene-08-first-day.png";
import jobStoryNine from "../images/job-story/scene-09-complex-work.png";
import jobStoryTen from "../images/job-story/scene-10-exhausted.png";
import jobStoryEleven from "../images/job-story/scene-11-reset.png";
import jobStoryTwelve from "../images/job-story/scene-12-next-chapter.png";
import resumeUrl from "../files/李聪-27届.pdf?url";
import GlobalCursorTrail from "./components/GlobalCursorTrail";

const ParticleText = lazy(() => import("./components/ParticleText"));
const ContactFluidBackground = lazy(() => import("./components/ContactFluidBackground"));

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
};

const internships = [
  {
    company: "携程集团｜去哪儿旅行",
    division: "技术中心 - AI LAB",
    role: "AI 产品经理（B 端）",
    period: "2026.06-2026.09",
    image: tripExperienceVisual,
    alt: "蓝色旅行主题插画，呈现携程集团去哪儿旅行的实习经历",
    summary: "面向公司多业务线的 AI 提效需求，开展业务调研与可行性评估，拆解业务流程并设计产品方案，推动 Demo 验证、数据与规则梳理、合规接入及效果迭代。制定 AI 工具合规使用 SOP 并开展培训，推动财务、内审团队约 40 人完成公司账户配置与规范使用。",
  },
  {
    company: "字节跳动｜懂车帝",
    division: "二手车服务履约与供应链 - SaaS 产品",
    role: "B 端产品经理",
    period: "2025.11-2026.03",
    image: dongchediExperienceVisual,
    alt: "懂车帝虎仔与黄色汽车的品牌视觉，呈现字节跳动懂车帝的实习经历",
    summary: "聚焦二手车收车履约与供应链场景，推进 B 端产品优化及 AI 能力建设，覆盖需求分析、PRD 与原型设计、方案评审、上线迭代、数据建设及 AI 归因落地；同步支持业务数据分析与线上问题响应。",
  },
];

const projects = [
  {
    company: "去哪儿旅行 / AI PRODUCT",
    name: "国际机票财务月报 Agent",
    role: "AI 产品经理（B 端）",
    problem: "月报依赖人工跨表取数与规则处理，制作耗时，也难以继续进行多维下钻分析。",
    action: "梳理报表口径与字段映射，设计取数、规则处理、模板生成和结果校验链路，推动合规接入与业务交付。",
    result: "约 10 分钟",
    metricLabel: "单次出报",
    description: "单次成本低于 1 元，连续 4 个月端到端核验准确率 100%，方案已被国内机票复用。",
    image: financeVisual,
    detailImage: financeDualTrackVisual,
    detailAlt: "固定月报与动态分析两条工作路径汇入最终财务月报的写实办公场景",
    href: "projects/flight-finance-agent.html",
    alt: "机场办公室中核对财务月报与数据看板的写实工作场景",
    isPersonal: false,
  },
  {
    company: "去哪儿旅行 / AI QUALITY",
    name: "酒店 UPS 工单质检自动化",
    role: "AI 产品经理（B 端）",
    problem: "质检员需要逐单还原分散的服务记录，人工覆盖成本高，复杂规则也容易产生判断偏差。",
    action: "将人工判断转为 Context Pack 和 AI 五级质检链路，通过金标、Bad Case 与 14 类场景规则持续迭代。",
    result: "19% → 75%",
    metricLabel: "三轮准确率迭代",
    description: "三轮迭代完成 19%、60%、75% 的准确率提升，继续向 90% 上线标准优化。",
    image: qualityVisual,
    href: "projects/hotel-ups-quality.html",
    alt: "酒店 UPS 工单质检自动化的 3D 概念视觉",
    isPersonal: false,
  },
  {
    company: "懂车帝 / AI ATTRIBUTION",
    name: "二手车收车侧 AI 智能归因",
    role: "B 端产品经理",
    problem: "收车战败节点分散，人工填写原因口径不一，难以支持规模化业务复盘与策略分析。",
    action: "搭建数据聚合、原因识别与三级标签归因链路，梳理 CRM 触发、回写及异常重试规则，推动线上闭环。",
    result: "95%",
    metricLabel: "500 条工单核验",
    description: "500 条工单人工核验一致率，单 Case 分析时间由约 20 分钟缩短至约 1 分钟。",
    image: attributionVisual,
    href: "projects/used-car-attribution.html",
    alt: "二手车收车侧 AI 智能归因的 3D 概念视觉",
    isPersonal: false,
  },
  {
    company: "个人项目 / AI CAREER TOOL",
    name: "求职小助手",
    role: "独立产品设计与开发",
    problem: "求职信息散落在招聘平台、文档和聊天记录中，每次投递都要重复整理岗位、准备材料并追踪进度。",
    action: "围绕岗位收集、JD 分析、简历匹配、投递准备与进度管理，完成需求梳理、产品方案、交互设计和功能实现。",
    result: "持续迭代",
    metricLabel: "当前状态",
    description: "以自己的真实求职流程验证产品，后续将补充产品截图、使用反馈和关键迭代记录。",
    image: jobStoryThree,
    href: "projects/job-search-assistant.html",
    alt: "求职小助手项目的求职材料整理场景插画",
    isPersonal: true,
  },
];

const galleryTop = [jobStoryOne, jobStoryTwo, jobStoryThree, jobStoryFour, jobStoryFive, jobStorySix];
const galleryBottom = [jobStorySeven, jobStoryEight, jobStoryNine, jobStoryTen, jobStoryEleven, jobStoryTwelve];

const heroCharacters = [
  { id: "lavender", alt: "Emily 的淡紫色休闲穿搭 3D 卡通形象", image: springCharacter, color: "#b7a7d6", label: "ON MY WAY" },
  { id: "sky", alt: "Emily 的浅蓝色连衣裙 3D 卡通形象", image: summerCharacter, color: "#a9cfda", label: "OFF DUTY" },
  { id: "caramel", alt: "Emily 的暖棕色街头穿搭 3D 卡通形象", image: autumnCharacter, color: "#d3ad96", label: "LOST IN THOUGHT" },
  { id: "pearl", alt: "Emily 的灰白色轻盈穿搭 3D 卡通形象", image: winterCharacter, color: "#c2ced4", label: "TAKING MY TIME" },
];

const heroParticleColors = ["#49314f"];

function FadeIn({ children, className = "", delay = 0, x = 0, y = 30 }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function InternshipCard({
  internship,
  index,
}: {
  internship: (typeof internships)[number];
  index: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <FadeIn delay={index * 0.1}>
      <article className={`internship-item${isFlipped ? " is-flipped" : ""}`}>
        <button
          type="button"
          className="internship-flip-control"
          aria-pressed={isFlipped}
          aria-label={isFlipped ? `返回${internship.company}经历正面` : `查看${internship.company}工作概述`}
          onClick={() => setIsFlipped((current) => !current)}
        >
          <span className="visually-hidden">{isFlipped ? "返回经历正面" : "查看工作概述"}</span>
        </button>

        <div className="internship-card-inner">
          <div className="internship-face internship-front" aria-hidden={isFlipped}>
            <img src={internship.image} alt={internship.alt} loading="lazy" />
            <div className="internship-scrim" aria-hidden="true" />
            <div className="internship-copy">
              <p>{internship.period}</p>
              <h3>{internship.company}</h3>
              <span>{internship.division}</span>
              <strong>{internship.role}</strong>
            </div>
            <span className="internship-flip-cue">
              <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
              工作概述
            </span>
          </div>

          <div className="internship-face internship-back" aria-hidden={!isFlipped}>
            <img src={internship.image} alt="" aria-hidden="true" />
            <div className="internship-back-scrim" aria-hidden="true" />
            <div className="internship-back-copy">
              <span className="internship-back-label">工作概述</span>
              <h3>{internship.company}</h3>
              <p>{internship.summary}</p>
              <div className="internship-back-meta">
                <span>{internship.division}</span>
                <strong>{internship.role}</strong>
              </div>
            </div>
            <span className="internship-flip-cue">
              <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
              返回正面
            </span>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

function ContactButton({ href = "#contact", children = "联系我" }: { href?: string; children?: ReactNode }) {
  return (
    <motion.a
      href={href}
      className="contact-button"
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
    </motion.a>
  );
}

function SeasonalHeroCarousel() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const transitionLock = useRef<number | null>(null);

  useEffect(() => {
    heroCharacters.forEach(({ image }) => {
      const preload = new Image();
      preload.src = image;
    });

    return () => {
      if (transitionLock.current !== null) {
        window.clearTimeout(transitionLock.current);
      }
    };
  }, []);

  const navigate = (direction: "previous" | "next") => {
    if (transitionLock.current !== null) return;

    setActiveIndex((current) => (
      direction === "next"
        ? (current + 1) % heroCharacters.length
        : (current - 1 + heroCharacters.length) % heroCharacters.length
    ));

    if (!reduceMotion) {
      transitionLock.current = window.setTimeout(() => {
        transitionLock.current = null;
      }, 650);
    }
  };

  const getPosition = (index: number) => {
    const offset = (index - activeIndex + heroCharacters.length) % heroCharacters.length;
    if (offset === 0) return "center";
    if (offset === 1) return "right";
    if (offset === heroCharacters.length - 1) return "left";
    return "back";
  };

  return (
    <motion.div
      className="hero-character-stage"
      style={{ "--character-color": heroCharacters[activeIndex].color } as CSSProperties}
      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {heroCharacters.map((character, index) => {
        const position = getPosition(index);
        const isActive = position === "center";

        return (
          <div
            className={`hero-character is-${position}`}
            aria-hidden={!isActive}
            key={character.id}
          >
            <img
              src={character.image}
              alt={isActive ? character.alt : ""}
              width={1024}
              height={1536}
            />
          </div>
        );
      })}

      <div className="hero-character-note-region" aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            className="hero-character-note"
            key={heroCharacters[activeIndex].id}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.94, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
            transition={reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 24 }}
            lang="en"
          >
            {heroCharacters[activeIndex].label}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="hero-carousel-controls" aria-label="切换首页人物形象">
        <button
          className="hero-carousel-button"
          type="button"
          aria-label="上一个人物形象"
          onClick={() => navigate("previous")}
        >
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
        <span className="hero-carousel-status" aria-live="polite">
          当前展示第 {activeIndex + 1} 个人物形象
        </span>
        <button
          className="hero-carousel-button"
          type="button"
          aria-label="下一个人物形象"
          onClick={() => navigate("next")}
        >
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </div>
    </motion.div>
  );
}

function GalleryRow({ images, direction }: { images: string[]; direction: "left" | "right" }) {
  return (
    <div className="gallery-row" aria-hidden="true">
      <div className="gallery-track">
        {[...images, ...images, ...images].map((image, index) => (
          <img src={image} alt="" loading="lazy" key={`${direction}-${index}`} />
        ))}
      </div>
    </div>
  );
}

function MovingGallery() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const topX = useTransform(scrollYProgress, [0, 1], ["-18%", "-4%"]);
  const bottomX = useTransform(scrollYProgress, [0, 1], ["-4%", "-18%"]);

  return (
    <section ref={ref} className="moving-gallery" aria-label="Emily 的求职成长故事">
      <motion.div style={reduceMotion ? undefined : { x: topX }}>
        <GalleryRow images={galleryTop} direction="right" />
      </motion.div>
      <motion.div style={reduceMotion ? undefined : { x: bottomX }}>
        <GalleryRow images={galleryBottom} direction="left" />
      </motion.div>
    </section>
  );
}

function ProjectStoryCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const [isMediaFlipped, setIsMediaFlipped] = useState(false);

  return (
    <motion.article
      className={`project-story-card${project.isPersonal ? " is-personal" : ""}`}
      style={{ "--project-index": index } as CSSProperties}
      initial={reduceMotion ? false : { opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="project-story-header">
        <strong className="project-story-number">0{index + 1}</strong>
        <div className="project-story-meta">
          <p>{project.company}</p>
          <span>{project.role}</span>
        </div>
      </header>

      <div className="project-story-body">
        <div className="project-story-copy">
          <h3>{project.name}</h3>
          <div className="project-story-point">
            <span>项目挑战</span>
            <p>{project.problem}</p>
          </div>
          <div className="project-story-point">
            <span>我的工作</span>
            <p>{project.action}</p>
          </div>
        </div>

        {project.detailImage ? (
          <figure className={`project-story-media has-flip${isMediaFlipped ? " is-flipped" : ""}`}>
            <div className="project-media-toolbar">
              <span>{isMediaFlipped ? "双链路方案" : "项目封面"}</span>
              <button
                type="button"
                aria-label={isMediaFlipped ? "翻回财务月报项目封面" : "翻看财务月报双链路方案"}
                aria-pressed={isMediaFlipped}
                onClick={() => setIsMediaFlipped((current) => !current)}
              >
                <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
                {isMediaFlipped ? "看封面" : "翻看方案"}
              </button>
            </div>

            <div className="project-media-flip-stage">
              <div className="project-media-flip-inner">
                <div className="project-media-face project-media-front">
                  <img src={project.image} alt={project.alt} loading="lazy" />
                </div>
                <div className="project-media-face project-media-back">
                  <img src={project.detailImage} alt={project.detailAlt} loading="lazy" />
                  <figcaption>
                    <strong>稳定 Workflow + 动态 Agent</strong>
                    <span>固定月报按模板出报，临时问题自主分析，两条链路共享权限、拦截与人工重试。</span>
                  </figcaption>
                </div>
              </div>
            </div>
          </figure>
        ) : (
          <figure className="project-story-media">
            <img src={project.image} alt={project.alt} loading="lazy" />
          </figure>
        )}
      </div>

      <footer className="project-story-result">
        <div className="project-story-metric">
          <span>{project.metricLabel}</span>
          <strong>{project.result}</strong>
        </div>
        <p>{project.description}</p>
        <motion.a
          className="project-link"
          href={project.href}
          aria-label={`查看${project.name}完整项目详情`}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          查看完整项目详情 <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
        </motion.a>
      </footer>
    </motion.article>
  );
}

function ProjectStack() {
  return (
    <div className="project-stack">
      {projects.map((project, index) => (
        <ProjectStoryCard
          project={project}
          index={index}
          key={project.name}
        />
      ))}
    </div>
  );
}

function ContactFinale() {
  const reduceMotion = useReducedMotion();
  const headX = useMotionValue(0);
  const headY = useMotionValue(0);
  const headRotate = useMotionValue(0);
  const smoothHeadX = useSpring(headX, { stiffness: 105, damping: 22, mass: 0.55 });
  const smoothHeadY = useSpring(headY, { stiffness: 105, damping: 22, mass: 0.55 });
  const smoothHeadRotate = useSpring(headRotate, { stiffness: 95, damping: 20, mass: 0.6 });

  const resetHead = () => {
    headX.set(0);
    headY.set(0);
    headRotate.set(0);
  };

  const followPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    headX.set(pointerX * 8);
    headY.set(pointerY * 4.5);
    headRotate.set(pointerX * 1.8);
  };

  return (
    <section
      className="contact"
      id="contact"
      onPointerMove={followPointer}
      onPointerLeave={resetHead}
    >
      <Suspense fallback={null}>
        <ContactFluidBackground />
      </Suspense>
      <div className="contact-grid" aria-hidden="true" />

      <div className="contact-content">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 34, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="contact-heading">
            <span>LET&apos;S</span>
            <span>TALK</span>
          </h2>
          <p className="contact-intro">想聊项目、产品或任何有意思的问题，都可以直接联系我。</p>
        </motion.div>

        <div className="contact-links">
          <FadeIn delay={0.14} y={18}>
            <a href="mailto:amilyl327@gmail.com"><Mail aria-hidden="true" size={20} strokeWidth={1.8} />amilyl327@gmail.com</a>
          </FadeIn>
          <FadeIn delay={0.2} y={18}>
            <a href="tel:+8617863869786"><Phone aria-hidden="true" size={20} strokeWidth={1.8} />+86 178 6386 9786</a>
          </FadeIn>
          <FadeIn delay={0.26} y={18}>
            <a href={resumeUrl} download><ArrowDownToLine aria-hidden="true" size={20} strokeWidth={1.8} />下载最新简历</a>
          </FadeIn>
        </div>
      </div>

      <motion.figure
        className="contact-character"
        initial={reduceMotion ? false : { opacity: 0, y: 54, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <img className="contact-character-body" src={contactCharacter} alt="" loading="lazy" draggable={false} />
        <motion.div
          className="contact-character-head"
          style={{ x: smoothHeadX, y: smoothHeadY, rotate: smoothHeadRotate }}
        >
          <img className="contact-character-head-image" src={contactCharacter} alt="" draggable={false} />
          <span className="contact-character-blink contact-character-blink-left" />
          <span className="contact-character-blink contact-character-blink-right" />
        </motion.div>
      </motion.figure>
    </section>
  );
}

function App() {
  return (
    <div className="site-shell">
      <GlobalCursorTrail />
      <a className="skip-link" href="#main">跳到主要内容</a>

      <main id="main">
        <section className="hero" id="home">
          <FadeIn y={-20}>
            <nav className="site-nav" aria-label="主要导航">
              <a href="#home">关于</a>
              <a href="#internships">经历</a>
              <a href="#projects">项目</a>
              <a href="#contact">联系</a>
            </nav>
          </FadeIn>

          <FadeIn className="hero-title-wrap" delay={0.15} y={40}>
            <h1 className="hero-title-accessible">HI, I&apos;M EMILY</h1>
            <Suspense fallback={<span className="particle-text-loading hero-heading" aria-hidden="true">HI, I&apos;M EMILY</span>}>
              <ParticleText
                text="HI, I'M EMILY"
                colors={heroParticleColors}
                particleSize={5}
                particleGap={3}
                fontSize={220}
                friction={0.82}
                ease={0.065}
                mouseControls={{ enabled: true, radius: 125, strength: 4.8 }}
              />
            </Suspense>
          </FadeIn>

          <SeasonalHeroCarousel />

          <div className="hero-bottom">
            <FadeIn delay={0.35} y={20}>
              <p className="hero-update">内容更新中</p>
            </FadeIn>
            <FadeIn delay={0.5} y={20}>
              <ContactButton />
            </FadeIn>
          </div>
        </section>

        <MovingGallery />

        <section className="internships" id="internships">
          <div className="internships-inner">
            <FadeIn>
              <h2 className="section-display section-heading internship-heading">EXPERIENCE</h2>
            </FadeIn>
            <div className="internship-list">
              {internships.map((internship, index) => (
                <InternshipCard key={internship.company} internship={internship} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="projects" id="projects">
          <span className="anchor-target" id="experience" aria-hidden="true" />
          <FadeIn className="projects-heading">
            <h2 className="section-display section-heading">PROJECTS</h2>
            <p>从业务问题出发，把 AI 能力做成可以落地、复用和持续迭代的产品方案。</p>
          </FadeIn>
          <ProjectStack />
        </section>

        <ContactFinale />
      </main>

      <footer className="site-footer">
        <a href="#home">回到首页</a>
      </footer>
    </div>
  );
}

export default App;
