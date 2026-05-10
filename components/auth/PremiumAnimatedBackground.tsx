"use client";

const STAR_COUNT = 90;

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const seed = (n: number) =>
    Math.abs(Math.sin((i + 1) * 9301 + n * 49297) * 233280) % 1;
  const size = 0.6 + seed(3) * 1.6;
  return {
    left: seed(1) * 100,
    top: seed(2) * 100,
    size,
    opacity: 0.18 + seed(4) * 0.55,
    glow: size > 1.4,
  };
});

export function PremiumAnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black isolate"
      aria-hidden="true"
    >
      {/* Faint base wash to add depth before the auroras */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 25% 15%, rgba(76, 60, 180, 0.10), transparent 60%), radial-gradient(ellipse 60% 80% at 90% 50%, rgba(40, 80, 200, 0.10), transparent 60%)",
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(140,170,230,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,230,0.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: "white",
              opacity: s.opacity,
              boxShadow: s.glow
                ? `0 0 ${s.size * 3}px rgba(200,210,255,0.55)`
                : undefined,
            }}
          />
        ))}
      </div>

      {/* Aurora 1 — top-left violet, primary */}
      <div className="aurora aurora-1" />
      {/* Aurora 1b — companion for nebula depth */}
      <div className="aurora aurora-1b" />
      {/* Aurora 2 — right side electric blue, vertical drape */}
      <div className="aurora aurora-2" />
      {/* Aurora 2b — companion */}
      <div className="aurora aurora-2b" />
      {/* Aurora 3 — bottom indigo wash */}
      <div className="aurora aurora-3" />

      {/* Cinematic film grain */}
      <div className="grain" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      <style jsx>{`
        .aurora {
          position: absolute;
          mix-blend-mode: screen;
          filter: blur(110px);
          pointer-events: none;
          will-change: transform, opacity;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          border-radius: 50%;
        }

        /* Top-left violet — wide elongated cloud */
        .aurora-1 {
          width: 64rem;
          height: 30rem;
          top: -8rem;
          left: -18rem;
          background: radial-gradient(
            ellipse 55% 60% at 50% 50%,
            rgba(139, 92, 246, 0.55) 0%,
            rgba(124, 58, 237, 0.32) 35%,
            rgba(99, 102, 241, 0.16) 60%,
            transparent 80%
          );
          opacity: 0.55;
          transform: rotate(-12deg);
          animation: drift1 42s infinite;
        }

        .aurora-1b {
          width: 50rem;
          height: 32rem;
          top: 2rem;
          left: -22rem;
          background: radial-gradient(
            ellipse 50% 60% at 50% 50%,
            rgba(167, 139, 250, 0.42) 0%,
            rgba(139, 92, 246, 0.22) 40%,
            transparent 78%
          );
          opacity: 0.4;
          transform: rotate(-26deg);
          animation: drift1b 56s infinite;
        }

        /* Right-side electric blue — tall drape */
        .aurora-2 {
          width: 36rem;
          height: 58rem;
          top: 2%;
          right: -14rem;
          background: radial-gradient(
            ellipse 50% 60% at 50% 50%,
            rgba(59, 130, 246, 0.55) 0%,
            rgba(37, 99, 235, 0.3) 35%,
            rgba(29, 78, 216, 0.12) 60%,
            transparent 80%
          );
          opacity: 0.55;
          transform: rotate(8deg);
          animation: drift2 48s infinite;
        }

        .aurora-2b {
          width: 32rem;
          height: 46rem;
          top: 38%;
          right: -18rem;
          background: radial-gradient(
            ellipse 50% 60% at 50% 50%,
            rgba(96, 165, 250, 0.38) 0%,
            rgba(59, 130, 246, 0.2) 40%,
            transparent 78%
          );
          opacity: 0.45;
          transform: rotate(18deg);
          animation: drift2b 60s infinite;
        }

        /* Bottom indigo wash — broad and faint */
        .aurora-3 {
          width: 60rem;
          height: 24rem;
          bottom: -8rem;
          left: 50%;
          background: radial-gradient(
            ellipse 60% 60% at 50% 50%,
            rgba(67, 56, 202, 0.4) 0%,
            rgba(49, 46, 129, 0.22) 40%,
            transparent 78%
          );
          opacity: 0.42;
          transform: translateX(-50%) rotate(-4deg);
          animation: drift3 64s infinite;
        }

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.65'/%3E%3C/svg%3E");
        }

        @keyframes drift1 {
          0%,
          100% {
            transform: rotate(-12deg) translate(0, 0) scale(1);
          }
          33% {
            transform: rotate(-9deg) translate(60px, 35px) scale(1.06);
          }
          66% {
            transform: rotate(-14deg) translate(-30px, 25px) scale(0.97);
          }
        }

        @keyframes drift1b {
          0%,
          100% {
            transform: rotate(-26deg) translate(0, 0) scale(1);
          }
          50% {
            transform: rotate(-20deg) translate(45px, -25px) scale(1.08);
          }
        }

        @keyframes drift2 {
          0%,
          100% {
            transform: rotate(8deg) translate(0, 0) scale(1);
          }
          50% {
            transform: rotate(11deg) translate(-50px, 50px) scale(1.05);
          }
        }

        @keyframes drift2b {
          0%,
          100% {
            transform: rotate(18deg) translate(0, 0) scale(1);
          }
          50% {
            transform: rotate(22deg) translate(-30px, -55px) scale(1.04);
          }
        }

        @keyframes drift3 {
          0%,
          100% {
            transform: translateX(-50%) rotate(-4deg) scale(1);
          }
          50% {
            transform: translateX(-46%) rotate(-2deg) scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
