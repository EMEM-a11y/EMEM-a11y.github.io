import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Mail,
  Phone,
} from "lucide-react";

import aboutOne from "../images/about-1.jpg";
import aboutTwo from "../images/about-2.jpg";
import aboutThree from "../images/about-3.jpg";
import aboutFour from "../images/about-4.jpg";
import homePhoto from "../images/home-photo.jpg";
import monash from "../images/monash-bg.jpg";
import sdau from "../images/sdau-bg.jpg";
import financeVisual from "../images/project-finance-3d.jpg";
import qualityVisual from "../images/project-quality-3d.jpg";
import attributionVisual from "../images/project-attribution-3d.jpg";
import springCharacter from "../images/toonhub/spring.png";
import summerCharacter from "../images/toonhub/summer.png";
import autumnCharacter from "../images/toonhub/autumn.png";
import winterCharacter from "../images/toonhub/winter.png";
import resumeUrl from "../files/李聪-27届.pdf?url";

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
    period: "2026.06-至今",
    image: financeVisual,
    alt: "携程集团去哪儿旅行实习经历的项目视觉",
  },
  {
    company: "字节跳动｜懂车帝",
    division: "二手车服务履约与供应链 - SaaS 产品",
    role: "B 端产品经理",
    period: "2025.11-2026.03",
    image: attributionVisual,
    alt: "字节跳动懂车帝实习经历的项目视觉",
  },
];

const projects = [
  {
    company: "携程集团 / AI PRODUCT",
    name: "国际机票财务月报 Agent",
    result: "约 10 分钟",
    description: "单次成本低于 1 元，连续 4 个月端到端核验准确率 100%，方案已被国内机票复用。",
    image: financeVisual,
    href: "projects/flight-finance-agent.html",
    alt: "财务月报 Agent 的 3D 概念视觉",
  },
  {
    company: "携程集团 / AI QUALITY",
    name: "酒店 UPS 工单质检自动化",
    result: "19% → 75%",
    description: "三轮迭代完成 19%、60%、75% 的准确率提升，继续向 90% 上线标准优化。",
    image: qualityVisual,
    href: "projects/hotel-ups-quality.html",
    alt: "酒店 UPS 工单质检自动化的 3D 概念视觉",
  },
  {
    company: "字节跳动 / AI ATTRIBUTION",
    name: "二手车收车侧 AI 智能归因",
    result: "95%",
    description: "500 条工单人工核验一致率，单 Case 分析时间由约 20 分钟缩短至约 1 分钟。",
    image: attributionVisual,
    href: "projects/used-car-attribution.html",
    alt: "二手车收车侧 AI 智能归因的 3D 概念视觉",
  },
];

const galleryTop = [financeVisual, aboutOne, qualityVisual, aboutTwo, attributionVisual, monash];
const galleryBottom = [aboutThree, sdau, aboutFour, financeVisual, homePhoto, qualityVisual];

const heroCharacters = [
  { id: "lavender", alt: "Emily 的淡紫色休闲穿搭 3D 卡通形象", image: springCharacter, color: "#b7a7d6" },
  { id: "sky", alt: "Emily 的浅蓝色连衣裙 3D 卡通形象", image: summerCharacter, color: "#a9cfda" },
  { id: "caramel", alt: "Emily 的暖棕色街头穿搭 3D 卡通形象", image: autumnCharacter, color: "#d3ad96" },
  { id: "pearl", alt: "Emily 的灰白色轻盈穿搭 3D 卡通形象", image: winterCharacter, color: "#c2ced4" },
];

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

function AnimatedCharacter({ progress, index, total, children }: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  children: string;
}) {
  const start = index / total;
  const end = Math.min(1, start + 0.16);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span aria-hidden="true" style={{ opacity }}>{children}</motion.span>;
}

function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const characters = Array.from(text);

  return (
    <p ref={ref} className="about-copy" aria-label={text}>
      {characters.map((character, index) => (
        reduceMotion ? (
          <span aria-hidden="true" key={`${character}-${index}`}>{character}</span>
        ) : (
          <AnimatedCharacter
            progress={scrollYProgress}
            index={index}
            total={characters.length}
            key={`${character}-${index}`}
          >
            {character}
          </AnimatedCharacter>
        )
      ))}
    </p>
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
    <section ref={ref} className="moving-gallery" aria-label="项目与个人影像">
      <motion.div style={reduceMotion ? undefined : { x: topX }}>
        <GalleryRow images={galleryTop} direction="right" />
      </motion.div>
      <motion.div style={reduceMotion ? undefined : { x: bottomX }}>
        <GalleryRow images={galleryBottom} direction="left" />
      </motion.div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  expanded,
  onToggle,
}: {
  project: (typeof projects)[number];
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const detailsId = `project-details-${index + 1}`;

  return (
    <motion.div
      layout
      className={`project-card-shell${expanded ? " is-active" : ""}`}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
    >
      <motion.article
        layout
        className="project-card"
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <button
          className="project-card-header"
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggle();
            }
          }}
        >
          <strong className="project-number">0{index + 1}</strong>
          <div className="project-title">
            <p>{project.company}</p>
            <h3>{project.name}</h3>
          </div>
          <strong className="project-summary">{project.result}</strong>
          <motion.span
            className="project-toggle"
            animate={reduceMotion ? undefined : { rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            aria-hidden="true"
          >
            <ChevronDown size={22} strokeWidth={1.8} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={detailsId}
              className="project-card-details"
              initial={reduceMotion ? false : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="project-result">
                <strong>{project.result}</strong>
                <p>{project.description}</p>
                <motion.a
                  className="project-link"
                  href={project.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  项目详情 <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
                </motion.a>
              </div>

              <div className="project-visual-grid">
                <div className="project-visual-column">
                  <img src={project.image} alt={`${project.alt}局部一`} loading="lazy" />
                  <img src={project.image} alt={`${project.alt}局部二`} loading="lazy" />
                </div>
                <img className="project-visual-main" src={project.image} alt={project.alt} loading="lazy" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </motion.div>
  );
}

function ProjectStack() {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  return (
    <div className="project-stack">
      {projects.map((project, index) => (
        <ProjectCard
          project={project}
          index={index}
          expanded={activeProject === index}
          onToggle={() => setActiveProject((current) => current === index ? null : index)}
          key={project.name}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">跳到主要内容</a>

      <main id="main">
        <section className="hero" id="home">
          <FadeIn y={-20}>
            <nav className="site-nav" aria-label="主要导航">
              <a href="#about">关于</a>
              <a href="#internships">经历</a>
              <a href="#projects">项目</a>
              <a href="#contact">联系</a>
            </nav>
          </FadeIn>

          <FadeIn className="hero-title-wrap" delay={0.15} y={40}>
            <h1 className="hero-heading">HI, I&apos;M EMILY</h1>
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

        <section className="about" id="about">
          <div className="about-center">
            <FadeIn y={40}>
              <h2 className="section-display hero-heading">ABOUT ME</h2>
            </FadeIn>
            <AnimatedText text="金融训练让我关注指标、风险与商业目标。产品实践让我把判断放进真实流程，再用数据、规则和 AI 把它推进到能用。" />
            <FadeIn delay={0.12}>
              <p className="about-education">Monash University / Master of Banking and Finance / 2027</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <ContactButton />
            </FadeIn>
          </div>
        </section>

        <section className="internships" id="internships">
          <div className="internships-inner">
            <FadeIn>
              <h2 className="section-display internship-heading">EXPERIENCE</h2>
            </FadeIn>
            <div className="internship-list">
              {internships.map((internship, index) => (
                <FadeIn key={internship.company} delay={index * 0.1}>
                  <article className="internship-item">
                    <img src={internship.image} alt={internship.alt} loading="lazy" />
                    <div className="internship-scrim" aria-hidden="true" />
                    <div className="internship-copy">
                      <p>{internship.period}</p>
                      <h3>{internship.company}</h3>
                      <span>{internship.division}</span>
                      <strong>{internship.role}</strong>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="projects" id="projects">
          <span className="anchor-target" id="experience" aria-hidden="true" />
          <FadeIn className="projects-heading">
            <h2 className="section-display hero-heading">PROJECTS</h2>
            <p>三段真实项目，展开查看问题、判断、行动与结果。</p>
          </FadeIn>
          <ProjectStack />
        </section>

        <section className="contact" id="contact">
          <FadeIn>
            <h2 className="section-display hero-heading">LET&apos;S TALK</h2>
          </FadeIn>
          <FadeIn className="contact-intro" delay={0.1}>
            <p>想聊项目、产品或任何有意思的问题，都可以直接联系我。</p>
          </FadeIn>
          <div className="contact-links">
            <FadeIn delay={0.14}>
              <a href="mailto:amilyl327@gmail.com"><Mail aria-hidden="true" size={20} strokeWidth={1.8} />amilyl327@gmail.com</a>
            </FadeIn>
            <FadeIn delay={0.2}>
              <a href="tel:+8617863869786"><Phone aria-hidden="true" size={20} strokeWidth={1.8} />+86 178 6386 9786</a>
            </FadeIn>
            <FadeIn delay={0.26}>
              <a href={resumeUrl} download><ArrowDownToLine aria-hidden="true" size={20} strokeWidth={1.8} />下载最新简历</a>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home">回到首页</a>
      </footer>
    </div>
  );
}

export default App;
