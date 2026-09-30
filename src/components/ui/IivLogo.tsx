import Image from 'next/image';

interface IivLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function IivLogo({ size = 'md', showText = true }: IivLogoProps) {
  const dimensions = {
    sm: { width: 40, height: 40, textSize: 'text-xs', titleSize: 'text-sm' },
    md: { width: 56, height: 56, textSize: 'text-[11px]', titleSize: 'text-lg' },
    lg: { width: 80, height: 80, textSize: 'text-xs', titleSize: 'text-2xl' },
  }[size];

  return (
    <div className="flex items-center gap-3.5 select-none">
      <div className="relative flex-shrink-0 drop-shadow-md">
        <Image
          src="/images/IIV_logo.png"
          alt="O'zbekiston IIV Emblemasi"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${dimensions.textSize} font-bold text-amber-600 uppercase tracking-wider leading-none`}>
            O'zbekiston Respublikasi IIV
          </span>
          <h1 className={`${dimensions.titleSize} font-extrabold text-slate-900 leading-tight tracking-tight mt-0.5`}>
            Xorazm Akademik Litseyi
          </h1>
          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
            Rasmiy axborot va ta'lim portali
          </span>
        </div>
      )}
    </div>
  );
}
