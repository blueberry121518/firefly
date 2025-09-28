import svgPaths from "./svg-g31hhmh9qm";

function Heading2() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">FSC Console</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Emergency Response System</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[48px] relative shrink-0 w-[191.219px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[48px] items-start relative w-[191.219px]">
        <Heading2 />
        <Paragraph />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M12 4L4 12" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M4 4L12 12" id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] relative rounded-[8px] shrink-0 size-[32px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-px relative size-[32px]">
        <Icon />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex h-[48px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container />
      <Button />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[12.5%] left-[37.5%] right-[37.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-11.11%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
            <path d={svgPaths.p2a7c2480} id="Vector" stroke="var(--stroke-0, #171717)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.34%_12.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.26%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15">
            <path d={svgPaths.p193f77a0} id="Vector" stroke="var(--stroke-0, #171717)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[147.594px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[147.594px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-900 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Dispatcher Dashboard</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[73.641px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[73.641px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-900 text-nowrap top-px whitespace-pre">Main Control</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[175.594px]" data-name="App">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-neutral-50 h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.333%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path d={svgPaths.p157ac340} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[73.328px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[73.328px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Agent Flow</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[90.672px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[90.672px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">Live Processing</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text2 />
        <Text3 />
      </div>
    </div>
  );
}

function App1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[118.672px]" data-name="App">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App1 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[13.48%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.7%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
            <path d={svgPaths.p39dfb900} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[24.02%_37.5%_13.48%_62.5%]" data-name="Vector">
        <div className="absolute inset-[-6.67%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 12">
            <path d="M1 1V11" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[13.48%_62.5%_24.02%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-6.67%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 12">
            <path d="M1 1V11" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon3 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[58.977px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[58.977px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Live Map</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[92.352px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[92.352px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">Full Screen Map</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text4 />
        <Text5 />
      </div>
    </div>
  );
}

function App2() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[120.352px]" data-name="App">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App2 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_16.67%_8.32%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-5%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 15">
            <path d={svgPaths.p37a36500} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[85.391px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[85.391px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Agent Status</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[85.906px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[85.906px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">8 Agent Status</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text6 />
        <Text7 />
      </div>
    </div>
  );
}

function App3() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[113.906px]" data-name="App">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App3 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.44%_8.34%_12.5%_8.26%]" data-name="Vector">
        <div className="absolute inset-[-5.55%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 14">
            <path d={svgPaths.p10143200} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[45.83%] left-1/2 right-1/2 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M1 1V3.66667" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.667px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
            <path d="M1 1H1.00667" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[104.859px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[104.859px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Incident History</p>
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[85.172px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[85.172px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">Historical Data</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text8 />
        <Text9 />
      </div>
    </div>
  );
}

function App4() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[132.859px]" data-name="App">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App4 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[29.17%_8.33%_45.83%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <path d="M1 1H5V5" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-10%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 9">
            <path d={svgPaths.p3a8cdec0} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[85.258px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[85.258px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Performance</p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[90.102px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[90.102px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">{`Metrics & NFPA`}</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text10 />
        <Text11 />
      </div>
    </div>
  );
}

function App5() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[118.102px]" data-name="App">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App5 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[32.34%_25%_32.34%_67.7%]" data-name="Vector">
        <div className="absolute inset-[-11.8%_-57.02%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 8">
            <path d={svgPaths.p3ce77f00} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.55%_8.33%_20.55%_79.48%]" data-name="Vector">
        <div className="absolute inset-[-7.08%_-34.19%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 12">
            <path d={svgPaths.p26c39dc0} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.55%_79.48%_20.55%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-7.08%_-34.19%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 12">
            <path d={svgPaths.p1329bb80} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[32.34%_67.7%_32.34%_25%]" data-name="Vector">
        <div className="absolute inset-[-11.8%_-57.02%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 8">
            <path d={svgPaths.p118f4a00} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.667%]" data-name="Vector">
        <div className="absolute inset-[-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d={svgPaths.p24e3ba80} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon7 />
      </div>
    </div>
  );
}

function Text12() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[82.008px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[82.008px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Architecture</p>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[16px] opacity-70 relative shrink-0 w-[100.078px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[100.078px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">System Overview</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Text12 />
        <Text13 />
      </div>
    </div>
  );
}

function App6() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[36px] items-center left-[12px] top-[12px] w-[128.078px]" data-name="App">
      <Container14 />
      <Container15 />
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[60px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <App6 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[468px] items-start relative shrink-0 w-full" data-name="Navigation">
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">System Status</p>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[16px] relative shrink-0 w-[90.039px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[90.039px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">Active Incidents</p>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[rgba(130,24,26,0.6)] h-[20px] relative rounded-[8px] shrink-0 w-[25.695px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20px] items-center justify-center overflow-clip px-[9px] py-[3px] relative w-[25.695px]">
        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre">3</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text14 />
      <Badge />
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[16px] relative shrink-0 w-[82.758px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[82.758px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">Available Units</p>
      </div>
    </div>
  );
}

function Badge1() {
  return (
    <div className="h-[20px] relative rounded-[8px] shrink-0 w-[25.891px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20px] items-center justify-center overflow-clip px-[9px] py-[3px] relative w-[25.891px]">
        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">8</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text15 />
      <Badge1 />
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[16px] relative shrink-0 w-[72.758px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[72.758px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">System Load</p>
      </div>
    </div>
  );
}

function Badge2() {
  return (
    <div className="h-[20px] relative rounded-[8px] shrink-0 w-[44.344px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20px] items-center justify-center overflow-clip px-[9px] py-[3px] relative w-[44.344px]">
        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">67%</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text16 />
      <Badge2 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[76px] items-start relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[rgba(38,38,38,0.5)] h-[142px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[12px] h-[142px] items-start pb-px pt-[17px] px-[17px] relative w-full">
          <Heading3 />
          <Container19 />
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[746px] relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] h-[746px] items-start pb-0 pt-[16px] px-[16px] relative w-full">
          <Container1 />
          <Navigation />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[2622px] relative shrink-0 w-[288px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-neutral-800 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[2622px] items-start pl-0 pr-px py-0 relative w-[288px]">
        <Container21 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[20px] text-neutral-950 text-nowrap top-0 tracking-[-0.4492px] whitespace-pre">Firefly Swarm Command (FSC)</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Distributed AI Architecture for Time-Critical Resource Optimization in Public Safety</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[52px] relative shrink-0 w-[533.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-start relative w-[533.992px]">
        <Heading1 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function App7() {
  return (
    <div className="bg-[#05df72] opacity-[0.973] relative rounded-[1.67772e+07px] shrink-0 size-[8px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[8px]" />
    </div>
  );
}

function App8() {
  return (
    <div className="h-[16px] relative shrink-0 w-[113.516px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[113.516px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-neutral-50 text-nowrap top-px whitespace-pre">System Operational</p>
      </div>
    </div>
  );
}

function Badge3() {
  return (
    <div className="basis-0 grow h-[22px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[22px] items-center justify-center overflow-clip p-px relative w-full">
        <App7 />
        <App8 />
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[11px] size-[16px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_783)" id="Icon">
          <path d={svgPaths.p2d09d900} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_783">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[32px] relative rounded-[8px] shrink-0 w-[115.414px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[32px] relative w-[115.414px]">
        <Icon8 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[37px] not-italic text-[14px] text-neutral-50 text-nowrap top-[6.5px] tracking-[-0.1504px] whitespace-pre">View Logs</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[32px] relative shrink-0 w-[278.93px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[32px] items-center relative w-[278.93px]">
        <Badge3 />
        <Button8 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex h-[68px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Text17() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-[41.15px] top-[9px] w-[47.602px]" data-name="Text">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#a1a1a1] text-[12px] text-nowrap whitespace-pre">seconds</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[88.75px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">47.9</p>
      <Text17 />
    </div>
  );
}

function Badge4() {
  return (
    <div className="absolute bg-[rgba(0,201,80,0.2)] h-[16px] left-0 rounded-[8px] top-[33.5px] w-[47.391px]" data-name="Badge">
      <div className="h-[16px] overflow-clip relative w-[47.391px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[9px] not-italic text-[#05df72] text-[12px] text-nowrap top-px whitespace-pre">good</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[52px] relative shrink-0 w-[88.75px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52px] relative w-[88.75px]">
        <Paragraph2 />
        <Badge4 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[58.063px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[58.063px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-[59px] not-italic text-[#a1a1a1] text-[12px] text-right top-px translate-x-[-100%] w-[59px]">Target: 60</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex h-[52px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Paragraph3 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">Call Processing Time (90% threshold)</p>
    </div>
  );
}

function Container28() {
  return <div className="bg-neutral-50 h-[4px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[4px] items-start overflow-clip pr-[51.599px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph4 />
      <PrimitiveDiv />
    </div>
  );
}

function App9() {
  return (
    <div className="h-[84px] relative shrink-0 w-[255px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[84px] items-start relative w-[255px]">
        <Container27 />
        <Container29 />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="[grid-area:1_/_1] bg-neutral-950 relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(38,38,38,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pl-[13px] pr-px pt-[13px] relative size-full">
          <App9 />
        </div>
      </div>
    </div>
  );
}

function Text18() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-[39.27px] top-[9px] w-[47.602px]" data-name="Text">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#a1a1a1] text-[12px] text-nowrap whitespace-pre">seconds</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[86.867px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">12.7</p>
      <Text18 />
    </div>
  );
}

function Badge5() {
  return (
    <div className="absolute bg-[rgba(240,177,0,0.2)] h-[16px] left-0 rounded-[8px] top-[33.5px] w-[64.008px]" data-name="Badge">
      <div className="h-[16px] overflow-clip relative w-[64.008px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[9px] not-italic text-[#fdc700] text-[12px] text-nowrap top-px whitespace-pre">warning</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[52px] relative shrink-0 w-[86.867px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52px] relative w-[86.867px]">
        <Paragraph5 />
        <Badge5 />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[55.844px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[55.844px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-[56px] not-italic text-[#a1a1a1] text-[12px] text-right top-px translate-x-[-100%] w-[56px]">Target: 15</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex h-[52px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">Internal Agent Processing</p>
    </div>
  );
}

function Container32() {
  return <div className="bg-neutral-50 h-[4px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv1() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[4px] items-start overflow-clip pr-[39.18px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container32 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph7 />
      <PrimitiveDiv1 />
    </div>
  );
}

function App10() {
  return (
    <div className="h-[84px] relative shrink-0 w-[255px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[84px] items-start relative w-[255px]">
        <Container31 />
        <Container33 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="[grid-area:1_/_2] bg-neutral-950 relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(38,38,38,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pl-[13px] pr-px pt-[13px] relative size-full">
          <App10 />
        </div>
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-[43.11px] top-[9px] w-[47.602px]" data-name="Text">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#a1a1a1] text-[12px] text-nowrap whitespace-pre">seconds</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[90.711px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">22.8</p>
      <Text19 />
    </div>
  );
}

function Badge6() {
  return (
    <div className="absolute bg-[rgba(0,201,80,0.2)] h-[16px] left-0 rounded-[8px] top-[33.5px] w-[47.391px]" data-name="Badge">
      <div className="h-[16px] overflow-clip relative w-[47.391px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[9px] not-italic text-[#05df72] text-[12px] text-nowrap top-px whitespace-pre">good</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[52px] relative shrink-0 w-[90.711px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52px] relative w-[90.711px]">
        <Paragraph8 />
        <Badge6 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[16px] relative shrink-0 w-[57.945px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[57.945px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-[58px] not-italic text-[#a1a1a1] text-[12px] text-right top-px translate-x-[-100%] w-[58px]">Target: 30</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex h-[52px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Paragraph9 />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">PSAP Transfer Time (95% threshold)</p>
    </div>
  );
}

function Container36() {
  return <div className="bg-neutral-50 h-[4px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv2() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[4px] items-start overflow-clip pr-[61.599px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container36 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph10 />
      <PrimitiveDiv2 />
    </div>
  );
}

function App11() {
  return (
    <div className="h-[84px] relative shrink-0 w-[255px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[84px] items-start relative w-[255px]">
        <Container35 />
        <Container37 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="[grid-area:1_/_3] bg-neutral-950 relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(38,38,38,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pl-[13px] pr-px pt-[13px] relative size-full">
          <App11 />
        </div>
      </div>
    </div>
  );
}

function Text20() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-start left-[52.36px] top-[9px] w-[11.109px]" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#a1a1a1] text-[12px]">%</p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[63.469px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">102.3</p>
      <Text20 />
    </div>
  );
}

function Badge7() {
  return (
    <div className="absolute bg-[rgba(251,44,54,0.2)] h-[16px] left-0 rounded-[8px] top-[33.5px] w-[57.227px]" data-name="Badge">
      <div className="h-[16px] overflow-clip relative w-[57.227px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[9px] not-italic text-[#ff6467] text-[12px] text-nowrap top-px whitespace-pre">critical</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[52px] relative shrink-0 w-[63.469px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52px] relative w-[63.469px]">
        <Paragraph11 />
        <Badge7 />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[16px] relative shrink-0 w-[68.406px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[68.406px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[16px] left-[69px] not-italic text-[#a1a1a1] text-[12px] text-right top-px translate-x-[-100%] w-[69px]">Target: 99.9</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex h-[52px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Paragraph12 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-px whitespace-pre">System Uptime</p>
    </div>
  );
}

function Container40() {
  return <div className="bg-neutral-50 h-[4px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv3() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container40 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph13 />
      <PrimitiveDiv3 />
    </div>
  );
}

function App12() {
  return (
    <div className="h-[84px] relative shrink-0 w-[255px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[84px] items-start relative w-[255px]">
        <Container39 />
        <Container41 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="[grid-area:1_/_4] bg-neutral-950 relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(38,38,38,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pl-[13px] pr-px pt-[13px] relative size-full">
          <App12 />
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="gap-[12px] grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[122px] relative shrink-0 w-full" data-name="Container">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon" opacity="0.972964">
          <path d={svgPaths.p28b1aae0} id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Text21() {
  return (
    <div className="basis-0 grow h-[28px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-full">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 top-0 tracking-[-0.4395px] w-[376px]">Live Processing: Fire/Medical - 123 Main Street</p>
      </div>
    </div>
  );
}

function DispatcherDashboard() {
  return (
    <div className="h-[28px] relative shrink-0 w-[411.383px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[28px] items-center relative w-[411.383px]">
        <Icon9 />
        <Text21 />
      </div>
    </div>
  );
}

function Badge8() {
  return (
    <div className="bg-[rgba(240,177,0,0.2)] h-[26px] relative rounded-[8px] shrink-0 w-[99.586px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[99.586px]">
        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#fdc700] text-[12px] text-nowrap whitespace-pre">3.8s elapsed</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge9() {
  return (
    <div className="basis-0 bg-[rgba(43,127,255,0.2)] grow h-[26px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center px-[13px] py-[5px] relative w-full">
          <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#51a2ff] text-[12px] text-nowrap whitespace-pre">1.2s remaining</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function DispatcherDashboard1() {
  return (
    <div className="h-[26px] relative shrink-0 w-[224.875px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[26px] items-center relative w-[224.875px]">
        <Badge8 />
        <Badge9 />
      </div>
    </div>
  );
}

function CardTitle() {
  return (
    <div className="h-[28px] relative shrink-0 w-[1110px]" data-name="CardTitle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[28px] items-center justify-between relative w-[1110px]">
        <DispatcherDashboard />
        <DispatcherDashboard1 />
      </div>
    </div>
  );
}

function Text22() {
  return (
    <div className="h-[24px] relative shrink-0 w-[147.57px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[147.57px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Layer 3: Verification</p>
      </div>
    </div>
  );
}

function Text23() {
  return (
    <div className="h-[24px] relative shrink-0 w-[104.516px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[104.516px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[105px]">75% complete</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text22 />
      <Text23 />
    </div>
  );
}

function Container44() {
  return <div className="bg-neutral-50 h-[16px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv4() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[16px] items-start overflow-clip pr-[277.5px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container44 />
    </div>
  );
}

function DispatcherDashboard2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[1110px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start relative w-[1110px]">
        <Container43 />
        <PrimitiveDiv4 />
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="bg-[rgba(240,177,0,0.1)] h-[180px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[46px] h-[180px] items-start pl-[25px] pr-px py-[25px] relative w-full">
          <CardTitle />
          <DispatcherDashboard2 />
        </div>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p27c543b0} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p2d59bff0} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard3() {
  return (
    <div className="h-[28px] relative shrink-0 w-[250.953px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[250.953px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Live Emergency Response Map</p>
      </div>
    </div>
  );
}

function CardTitle1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[28px] items-center left-[25px] top-[25px] w-[1110px]" data-name="CardTitle">
      <Icon10 />
      <DispatcherDashboard3 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[56.25%_43.95%_34.5%_52.59%]" data-name="Group">
      <div className="absolute inset-[59.5%_44.65%_34.5%_53.28%]" data-name="Vector">
        <div className="absolute inset-[-4.167%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 26">
            <path d={svgPaths.p35c26100} fill="var(--fill-0, #DC2626)" id="Vector" opacity="0.972964" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[56.25%_43.95%_40.75%_52.59%] leading-[normal] not-italic text-[10px] text-center text-nowrap text-white whitespace-pre">INC-001</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[48.75%_28.37%_42.5%_68.09%]" data-name="Group">
      <div className="absolute inset-[52.5%_29.27%_42.5%_69%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <path d={svgPaths.pb60700} fill="var(--fill-0, #EA580C)" id="Vector" opacity="0.972964" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[48.75%_28.37%_48.25%_68.09%] leading-[normal] not-italic text-[10px] text-center text-nowrap text-white whitespace-pre">INC-002</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[38.75%_50.82%_53%_45.64%]" data-name="Group">
      <div className="absolute inset-[43%_51.9%_53%_46.72%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #D97706)" id="Vector" opacity="0.972964" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[38.75%_50.82%_58.25%_45.64%] leading-[normal] not-italic text-[10px] text-center text-nowrap text-white whitespace-pre">INC-003</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[62.69%_47.28%_26.82%_49.95%]" data-name="Group">
      <div className="absolute inset-[65.69%_47.98%_30.32%_50.64%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #EAB308)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[66.44%_48.41%_31.07%_51.07%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">A</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[70.69%_47.33%_26.82%_49.99%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">AMB-01</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[62.69%_47.28%_34.81%_49.95%] leading-[normal] not-italic text-[8px] text-amber-400 text-center text-nowrap whitespace-pre">ETA: 3m</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[43%_65.89%_49.5%_31.35%]" data-name="Group">
      <div className="absolute inset-[43%_66.58%_53%_32.04%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #22C55E)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[43.75%_67.01%_53.75%_32.47%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">A</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[48%_65.89%_49.5%_31.35%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">AMB-02</p>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[53%_28.84%_39.5%_68.57%]" data-name="Group">
      <div className="absolute inset-[53%_29.45%_43%_69.17%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #EF4444)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[53.75%_29.92%_43.75%_69.65%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">F</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[58%_28.84%_39.5%_68.57%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">FIRE-01</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-[83%_42.62%_9.5%_54.71%]" data-name="Group">
      <div className="absolute inset-[83%_43.26%_13%_55.35%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #8B5CF6)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[83.75%_43.74%_13.75%_55.83%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">F</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[88%_42.62%_9.5%_54.71%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">FIRE-02</p>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[42.99%_53.36%_46.51%_44.05%]" data-name="Group">
      <div className="absolute inset-[45.99%_53.96%_50.01%_44.66%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #EAB308)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[46.74%_54.4%_50.76%_45.09%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">P</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[50.99%_53.62%_46.51%_44.31%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">PD-01</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[42.99%_53.36%_54.51%_44.05%] leading-[normal] not-italic text-[8px] text-amber-400 text-center text-nowrap whitespace-pre">ETA: 1m</p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[38%_37.69%_54.5%_60.15%]" data-name="Group">
      <div className="absolute inset-[38%_38.08%_58%_60.53%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #22C55E)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[38.75%_38.52%_58.75%_60.97%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">P</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[43%_37.69%_54.5%_60.15%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">PD-02</p>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents inset-[93%_61.57%_-0.5%_35.66%]" data-name="Group">
      <div className="absolute inset-[93%_62.26%_3%_36.36%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #22C55E)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[93.75%_62.69%_3.75%_36.79%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">A</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[98%_61.57%_-0.5%_35.66%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">AMB-03</p>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents inset-[83%_33.98%_9.5%_63.34%]" data-name="Group">
      <div className="absolute inset-[83%_34.63%_13%_63.99%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.pedb3a30} fill="var(--fill-0, #22C55E)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[83.75%_35.1%_13.75%_64.47%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">F</p>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[88%_33.98%_9.5%_63.34%] leading-[normal] not-italic text-[8px] text-center text-nowrap text-white whitespace-pre">FIRE-03</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute bg-gray-800 h-[400px] left-0 overflow-clip top-0 w-[1158px]" data-name="Icon">
      <div className="absolute bottom-0 left-[19.77%] right-[19.77%] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector"></g>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[19.77%] right-[19.77%] top-1/2" data-name="Vector">
        <div className="absolute bottom-[-2px] left-0 right-0 top-[-2px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 4">
            <path d="M0 2H700" id="Vector" stroke="var(--stroke-0, #4B5563)" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-[37.05%] right-[62.95%] top-0" data-name="Vector">
        <div className="absolute bottom-0 left-[-2px] right-[-2px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 400">
            <path d="M2 0V400" id="Vector" stroke="var(--stroke-0, #4B5563)" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-[62.95%] right-[37.05%] top-0" data-name="Vector">
        <div className="absolute bottom-0 left-[-2px] right-[-2px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 400">
            <path d="M2 0V400" id="Vector" stroke="var(--stroke-0, #4B5563)" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[19.77%] right-[19.77%] top-1/4" data-name="Vector">
        <div className="absolute bottom-[-1px] left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 2">
            <path d="M0 1H700" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[19.77%] right-[19.77%] top-3/4" data-name="Vector">
        <div className="absolute bottom-[-1px] left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 2">
            <path d="M0 1H700" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 right-1/2 top-0" data-name="Vector">
        <div className="absolute bottom-0 left-[-1px] right-[-1px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 400">
            <path d="M1 0V400" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45%_61.23%_45%_35.32%]" data-name="Vector">
        <div className="absolute inset-[-1.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
            <path d="M41 1H1V41H41V1Z" fill="var(--fill-0, #374151)" id="Vector" stroke="var(--stroke-0, #4B5563)" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20%_35.32%_70%_61.23%]" data-name="Vector">
        <div className="absolute inset-[-1.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
            <path d="M41 1H1V41H41V1Z" fill="var(--fill-0, #374151)" id="Vector" stroke="var(--stroke-0, #4B5563)" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[70%_47.41%_20%_47.41%]" data-name="Vector">
        <div className="absolute inset-[-1.25%_-0.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 42">
            <path d="M61 1H1V41H61V1Z" fill="var(--fill-0, #374151)" id="Vector" stroke="var(--stroke-0, #4B5563)" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_64.68%_55%_32.73%]" data-name="Vector">
        <div className="absolute inset-[-1.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <path d="M31 1H1V31H31V1Z" fill="var(--fill-0, #DC2626)" id="Vector" stroke="var(--stroke-0, #EF4444)" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[39%_65.59%_57.25%_33.64%] leading-[normal] not-italic text-[12px] text-center text-nowrap text-white whitespace-pre">H</p>
      <div className="absolute inset-[80%_32.73%_12.5%_64.68%]" data-name="Vector">
        <div className="absolute inset-[-1.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <path d="M31 1H1V31H31V1Z" fill="var(--fill-0, #EA580C)" id="Vector" stroke="var(--stroke-0, #F97316)" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[81.5%_33.68%_14.75%_65.63%] leading-[normal] not-italic text-[12px] text-center text-nowrap text-white whitespace-pre">F</p>
      <div className="absolute inset-[12.5%_73.32%_80%_24.09%]" data-name="Vector">
        <div className="absolute inset-[-1.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <path d="M31 1H1V31H31V1Z" fill="var(--fill-0, #2563EB)" id="Vector" stroke="var(--stroke-0, #3B82F6)" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal inset-[14%_74.27%_82.25%_25.04%] leading-[normal] not-italic text-[12px] text-center text-nowrap text-white whitespace-pre">P</p>
      <div className="absolute inset-[62.5%_45.68%_32.31%_51.33%]" data-name="Vector">
        <div className="absolute inset-[-4.13%_-1.49%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 23">
            <path d="M1 21.7391L35.5651 1" id="Vector" opacity="0.7" stroke="var(--stroke-0, #EAB308)" strokeDasharray="5 5" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45%_52.59%_52.01%_45.34%]" data-name="Vector">
        <div className="absolute inset-[-7.48%_-1.87%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 14">
            <path d="M1 12.9501L24.9003 1" id="Vector" opacity="0.7" stroke="var(--stroke-0, #EAB308)" strokeDasharray="5 5" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <Group />
      <Group1 />
      <Group2 />
      <Group3 />
      <Group4 />
      <Group5 />
      <Group6 />
      <Group7 />
      <Group8 />
      <Group9 />
      <Group10 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-[11px] size-[16px] top-[6px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_720)" id="Icon">
          <path d={svgPaths.p18ae4a80} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3dd52f00} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2d792300} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_720">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[28px] relative rounded-[8px] shrink-0 w-[88.117px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[88.117px]">
        <Icon12 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[37px] not-italic text-[12px] text-neutral-50 text-nowrap top-[7px] whitespace-pre">Routes</p>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="absolute left-[11px] size-[16px] top-[6px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p12949080} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 2V5.33333H5.33333" id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="basis-0 bg-[rgba(38,38,38,0.3)] grow h-[28px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-full">
        <Icon13 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[16px] left-[37px] not-italic text-[12px] text-neutral-50 text-nowrap top-[7px] whitespace-pre">Refresh</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[28px] items-center left-[961.28px] top-[8px] w-[188.719px]" data-name="Container">
      <Button9 />
      <Button10 />
    </div>
  );
}

function EmergencyMap() {
  return (
    <div className="absolute bg-[#1e2939] h-[400px] left-px overflow-clip rounded-[10px] top-[99px] w-[1158px]" data-name="EmergencyMap">
      <Icon11 />
      <Container45 />
    </div>
  );
}

function Card5() {
  return (
    <div className="bg-neutral-950 h-[524px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardTitle1 />
      <EmergencyMap />
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p1b851600} id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 9V13" id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 17H12.01" id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard4() {
  return (
    <div className="basis-0 grow h-[28px] min-h-px min-w-px relative shrink-0" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-full">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 top-0 tracking-[-0.4395px] w-[156px]">Active Incidents (3)</p>
      </div>
    </div>
  );
}

function CardTitle2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[191.477px]" data-name="CardTitle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[28px] items-center relative w-[191.477px]">
        <Icon14 />
        <DispatcherDashboard4 />
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_725)" id="Icon">
          <path d={svgPaths.p26187580} id="Vector" stroke="var(--stroke-0, #171717)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_725">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-[#00a63e] h-[40px] relative rounded-[8px] shrink-0 w-[121.938px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-[121.938px]">
        <Icon15 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[48px] not-italic text-[14px] text-neutral-900 text-nowrap top-[10.5px] tracking-[-0.1504px] whitespace-pre">New Call</p>
      </div>
    </div>
  );
}

function DispatcherDashboard5() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-center justify-between left-[25px] top-[25px] w-[712.664px]" data-name="DispatcherDashboard">
      <CardTitle2 />
      <Button11 />
    </div>
  );
}

function Badge10() {
  return (
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-[152.211px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[38px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[152.211px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[28px] not-italic relative shrink-0 text-[18px] text-neutral-50 text-nowrap tracking-[-0.4395px] whitespace-pre">INC-2024-001</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Cardiac Emergency</p>
    </div>
  );
}

function Icon16() {
  return (
    <div className="absolute left-0 size-[16px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <Icon16 />
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-[24px] not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">{`Main St & 5th Ave`}</p>
    </div>
  );
}

function Container46() {
  return (
    <div className="basis-0 grow h-[56px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[56px] items-start relative w-full">
        <Heading4 />
        <Paragraph14 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[56px] relative shrink-0 w-[332.086px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[56px] items-center relative w-[332.086px]">
        <Badge10 />
        <Container46 />
      </div>
    </div>
  );
}

function Badge11() {
  return (
    <div className="bg-[rgba(130,24,26,0.6)] h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Badge">
      <div className="h-[34px] overflow-clip relative w-full">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-[87px] not-italic text-[16px] text-nowrap text-right text-white top-[4.5px] tracking-[-0.3125px] translate-x-[-100%] whitespace-pre">CRITICAL</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-[100.75px] not-italic text-[#a1a1a1] text-[14px] text-nowrap text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] whitespace-pre">14:32:18</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[62px] relative shrink-0 w-[99.961px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[62px] items-start relative w-[99.961px]">
        <Badge11 />
        <Paragraph15 />
      </div>
    </div>
  );
}

function DispatcherDashboard6() {
  return (
    <div className="content-stretch flex h-[62px] items-start justify-between relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container47 />
      <Container48 />
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Status</p>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[#ff8904] text-[18px] text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Enroute</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute content-stretch flex flex-col h-[58px] items-start left-0 top-0 w-[204.219px]" data-name="Container">
      <Paragraph16 />
      <Paragraph17 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Processing Time</p>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 top-0 tracking-[-0.4395px] w-[38px]">8.2s</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute content-stretch flex flex-col h-[58px] items-start left-[228.22px] top-0 w-[204.219px]" data-name="Container">
      <Paragraph18 />
      <Paragraph19 />
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Units Assigned</p>
    </div>
  );
}

function Badge12() {
  return (
    <div className="absolute bg-neutral-800 h-[30px] left-0 rounded-[8px] top-0 w-[73.289px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[30px] items-center justify-center overflow-clip px-[9px] py-[5px] relative w-[73.289px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">AMB-01</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge13() {
  return (
    <div className="absolute bg-neutral-800 h-[30px] left-[81.29px] rounded-[8px] top-0 w-[62.781px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[30px] items-center justify-center overflow-clip px-[9px] py-[5px] relative w-[62.781px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">PD-03</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Container">
      <Badge12 />
      <Badge13 />
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[58px] items-start left-[456.44px] top-0 w-[204.227px]" data-name="Container">
      <Paragraph20 />
      <Container51 />
    </div>
  );
}

function DispatcherDashboard7() {
  return (
    <div className="h-[58px] relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container49 />
      <Container50 />
      <Container52 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_5_710)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 5V10L13.3333 11.6667" id="Vector_2" stroke="var(--stroke-0, #FF8904)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_5_710">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text24() {
  return (
    <div className="h-[24px] relative shrink-0 w-[115.977px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[115.977px]">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-0 not-italic text-[#ff8904] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[116px]">ETA: 3 minutes</p>
      </div>
    </div>
  );
}

function DispatcherDashboard8() {
  return (
    <div className="content-stretch flex gap-[12px] h-[24px] items-center relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Icon17 />
      <Text24 />
    </div>
  );
}

function CardContent() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[708.664px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start pb-0 pt-[24px] px-[24px] relative w-[708.664px]">
        <DispatcherDashboard6 />
        <DispatcherDashboard7 />
        <DispatcherDashboard8 />
      </div>
    </div>
  );
}

function Card6() {
  return (
    <div className="bg-[rgba(251,44,54,0.1)] box-border content-stretch flex flex-col h-[228px] items-start p-[2px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(251,44,54,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent />
    </div>
  );
}

function Badge14() {
  return (
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-[154.562px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[38px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[154.562px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[28px] not-italic relative shrink-0 text-[18px] text-neutral-50 text-nowrap tracking-[-0.4395px] whitespace-pre">INC-2024-002</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Structure Fire</p>
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-0 size-[16px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <Icon18 />
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-[24px] not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Oak Grove Complex</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="basis-0 grow h-[56px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[56px] items-start relative w-full">
        <Heading5 />
        <Paragraph21 />
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[56px] relative shrink-0 w-[338.414px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[56px] items-center relative w-[338.414px]">
        <Badge14 />
        <Container53 />
      </div>
    </div>
  );
}

function Badge15() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Badge">
      <div className="h-[34px] overflow-clip relative w-full">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-[55px] not-italic text-[16px] text-neutral-50 text-nowrap text-right top-[4.5px] tracking-[-0.3125px] translate-x-[-100%] whitespace-pre">HIGH</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-[67.33px] not-italic text-[#a1a1a1] text-[14px] text-nowrap text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] whitespace-pre">14:28:45</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[62px] relative shrink-0 w-[67.07px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[62px] items-start relative w-[67.07px]">
        <Badge15 />
        <Paragraph22 />
      </div>
    </div>
  );
}

function DispatcherDashboard9() {
  return (
    <div className="content-stretch flex h-[62px] items-start justify-between relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container54 />
      <Container55 />
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Status</p>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[#05df72] text-[18px] text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Onscene</p>
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute content-stretch flex flex-col h-[96px] items-start left-0 top-0 w-[204.219px]" data-name="Container">
      <Paragraph23 />
      <Paragraph24 />
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Processing Time</p>
    </div>
  );
}

function Paragraph26() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 top-0 tracking-[-0.4395px] w-[47px]">12.8s</p>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute content-stretch flex flex-col h-[96px] items-start left-[228.22px] top-0 w-[204.219px]" data-name="Container">
      <Paragraph25 />
      <Paragraph26 />
    </div>
  );
}

function Paragraph27() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Units Assigned</p>
    </div>
  );
}

function Badge16() {
  return (
    <div className="absolute bg-neutral-800 h-[30px] left-0 rounded-[8px] top-0 w-[71.734px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[30px] items-center justify-center overflow-clip px-[9px] py-[5px] relative w-[71.734px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">FIRE-01</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge17() {
  return (
    <div className="absolute bg-neutral-800 h-[30px] left-[79.73px] rounded-[8px] top-0 w-[73.57px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[30px] items-center justify-center overflow-clip px-[9px] py-[5px] relative w-[73.57px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">FIRE-02</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge18() {
  return (
    <div className="absolute bg-neutral-800 h-[30px] left-0 rounded-[8px] top-[38px] w-[71.195px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[30px] items-center justify-center overflow-clip px-[9px] py-[5px] relative w-[71.195px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">EMS-15</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[68px] relative shrink-0 w-full" data-name="Container">
      <Badge16 />
      <Badge17 />
      <Badge18 />
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[96px] items-start left-[456.44px] top-0 w-[204.227px]" data-name="Container">
      <Paragraph27 />
      <Container58 />
    </div>
  );
}

function DispatcherDashboard10() {
  return (
    <div className="h-[96px] relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container56 />
      <Container57 />
      <Container59 />
    </div>
  );
}

function CardContent1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[708.664px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start pb-0 pt-[24px] px-[24px] relative w-[708.664px]">
        <DispatcherDashboard9 />
        <DispatcherDashboard10 />
      </div>
    </div>
  );
}

function Card7() {
  return (
    <div className="bg-[rgba(255,105,0,0.1)] box-border content-stretch flex flex-col h-[226px] items-start p-[2px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,105,0,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent1 />
    </div>
  );
}

function Badge19() {
  return (
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-[154.906px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[38px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[154.906px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[28px] not-italic relative shrink-0 text-[18px] text-neutral-50 text-nowrap tracking-[-0.4395px] whitespace-pre">INC-2024-003</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Traffic Accident</p>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-0 size-[16px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph28() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <Icon19 />
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-[24px] not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">{`Highway 101 & Exit 23`}</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="basis-0 grow h-[56px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[56px] items-start relative w-full">
        <Heading6 />
        <Paragraph28 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[56px] relative shrink-0 w-[353.984px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[56px] items-center relative w-[353.984px]">
        <Badge19 />
        <Container60 />
      </div>
    </div>
  );
}

function Badge20() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Badge">
      <div className="h-[34px] overflow-clip relative w-full">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-[80px] not-italic text-[16px] text-neutral-50 text-nowrap text-right top-[4.5px] tracking-[-0.3125px] translate-x-[-100%] whitespace-pre">MEDIUM</p>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Paragraph29() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-[92.39px] not-italic text-[#a1a1a1] text-[14px] text-nowrap text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] whitespace-pre">14:35:12</p>
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[62px] relative shrink-0 w-[92.313px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[62px] items-start relative w-[92.313px]">
        <Badge20 />
        <Paragraph29 />
      </div>
    </div>
  );
}

function DispatcherDashboard11() {
  return (
    <div className="content-stretch flex h-[62px] items-start justify-between relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container61 />
      <Container62 />
    </div>
  );
}

function Paragraph30() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Status</p>
    </div>
  );
}

function Paragraph31() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[#fdc700] text-[18px] text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Processing</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex flex-col h-[52px] items-start left-0 top-0 w-[204.219px]" data-name="Container">
      <Paragraph30 />
      <Paragraph31 />
    </div>
  );
}

function Paragraph32() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Processing Time</p>
    </div>
  );
}

function Paragraph33() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-neutral-50 top-0 tracking-[-0.4395px] w-[35px]">4.1s</p>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute content-stretch flex flex-col h-[52px] items-start left-[228.22px] top-0 w-[204.219px]" data-name="Container">
      <Paragraph32 />
      <Paragraph33 />
    </div>
  );
}

function Paragraph34() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[204.227px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#a1a1a1] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Units Assigned</p>
    </div>
  );
}

function Text25() {
  return (
    <div className="absolute h-[20px] left-0 top-[28px] w-[53.813px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Pending</p>
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute h-[52px] left-[456.44px] top-0 w-[204.227px]" data-name="Container">
      <Paragraph34 />
      <Text25 />
    </div>
  );
}

function DispatcherDashboard12() {
  return (
    <div className="h-[52px] relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container63 />
      <Container64 />
      <Container65 />
    </div>
  );
}

function CardContent2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[708.664px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start pb-0 pt-[24px] px-[24px] relative w-[708.664px]">
        <DispatcherDashboard11 />
        <DispatcherDashboard12 />
      </div>
    </div>
  );
}

function Card8() {
  return (
    <div className="bg-[rgba(240,177,0,0.1)] box-border content-stretch flex flex-col h-[182px] items-start p-[2px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(240,177,0,0.5)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardContent2 />
    </div>
  );
}

function CardContent3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[16px] h-[692px] items-start left-px px-[24px] py-0 top-[111px] w-[760.664px]" data-name="CardContent">
      <Card6 />
      <Card7 />
      <Card8 />
    </div>
  );
}

function Card9() {
  return (
    <div className="absolute bg-neutral-950 h-[804px] left-0 rounded-[14px] top-0 w-[762.664px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <DispatcherDashboard5 />
      <CardContent3 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d="M16 7H22V13" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p13253c0} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard13() {
  return (
    <div className="h-[28px] relative shrink-0 w-[115.82px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[115.82px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">System Status</p>
      </div>
    </div>
  );
}

function CardTitle3() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[28px] items-center left-[25px] top-[25px] w-[315.336px]" data-name="CardTitle">
      <Icon20 />
      <DispatcherDashboard13 />
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[32px] left-[58.16px] not-italic text-[#ff6467] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">3</p>
    </div>
  );
}

function Container67() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[58.3px] not-italic text-[14px] text-center text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Active</p>
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute bg-[rgba(251,44,54,0.2)] box-border content-stretch flex flex-col h-[86px] items-start left-0 pb-px pt-[17px] px-[17px] rounded-[10px] top-0 w-[149.664px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container66 />
      <Container67 />
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[32px] left-[57.91px] not-italic text-[#05df72] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">8</p>
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[57.95px] not-italic text-[14px] text-center text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Available</p>
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute bg-[rgba(0,201,80,0.2)] box-border content-stretch flex flex-col h-[86px] items-start left-[165.66px] pb-px pt-[17px] px-[17px] rounded-[10px] top-0 w-[149.672px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container69 />
      <Container70 />
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[32px] left-[57.34px] not-italic text-[#51a2ff] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">15</p>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[58.2px] not-italic text-[14px] text-center text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Deployed</p>
    </div>
  );
}

function Container74() {
  return (
    <div className="absolute bg-[rgba(43,127,255,0.2)] box-border content-stretch flex flex-col h-[86px] items-start left-0 pb-px pt-[17px] px-[17px] rounded-[10px] top-[102px] w-[149.664px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(43,127,255,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container72 />
      <Container73 />
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[32px] left-[57.84px] not-italic text-[#c27aff] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">247</p>
    </div>
  );
}

function Container76() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[58.54px] not-italic text-[14px] text-center text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Today</p>
    </div>
  );
}

function Container77() {
  return (
    <div className="absolute bg-[rgba(173,70,255,0.2)] box-border content-stretch flex flex-col h-[86px] items-start left-[165.66px] pb-px pt-[17px] px-[17px] rounded-[10px] top-[102px] w-[149.672px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(173,70,255,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Container75 />
      <Container76 />
    </div>
  );
}

function DispatcherDashboard14() {
  return (
    <div className="h-[188px] relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container68 />
      <Container71 />
      <Container74 />
      <Container77 />
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[24px] relative shrink-0 w-[122.789px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[122.789px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Processing Time</p>
      </div>
    </div>
  );
}

function Text27() {
  return (
    <div className="h-[24px] relative shrink-0 w-[39.766px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[39.766px]">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-neutral-50 top-[-0.5px] tracking-[-0.3125px] w-[40px]">11.4s</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex h-[24px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Text26 />
      <Text27 />
    </div>
  );
}

function Container79() {
  return <div className="bg-neutral-50 h-[12px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv5() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[12px] items-start overflow-clip pr-[239.655px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container79 />
    </div>
  );
}

function Paragraph35() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Target: ≤15.0s</p>
    </div>
  );
}

function Container80() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[68px] items-start relative shrink-0 w-full" data-name="Container">
      <Container78 />
      <PrimitiveDiv5 />
      <Paragraph35 />
    </div>
  );
}

function Text28() {
  return (
    <div className="h-[24px] relative shrink-0 w-[95.648px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[95.648px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">System Load</p>
      </div>
    </div>
  );
}

function Text29() {
  return (
    <div className="h-[24px] relative shrink-0 w-[36.242px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[36.242px]">
        <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-neutral-50 top-[-0.5px] tracking-[-0.3125px] w-[37px]">67%</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="content-stretch flex h-[24px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Text28 />
      <Text29 />
    </div>
  );
}

function Container82() {
  return <div className="bg-neutral-50 h-[12px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv6() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[12px] items-start overflow-clip pr-[104.061px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container82 />
    </div>
  );
}

function Paragraph36() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">{`Optimal: <80%`}</p>
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[68px] items-start relative shrink-0 w-full" data-name="Container">
      <Container81 />
      <PrimitiveDiv6 />
      <Paragraph36 />
    </div>
  );
}

function DispatcherDashboard15() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[152px] items-start relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Container80 />
      <Container83 />
    </div>
  );
}

function CardContent4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[24px] h-[388px] items-start left-px px-[24px] py-0 top-[99px] w-[363.336px]" data-name="CardContent">
      <DispatcherDashboard14 />
      <DispatcherDashboard15 />
    </div>
  );
}

function Card10() {
  return (
    <div className="bg-neutral-950 h-[488px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardTitle3 />
      <CardContent4 />
    </div>
  );
}

function Icon21() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p67fd620} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M15 18H9" id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p2beec100} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p13934880} id="Vector_4" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p1ff3c700} id="Vector_5" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard16() {
  return (
    <div className="h-[28px] relative shrink-0 w-[88.891px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[88.891px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Unit Status</p>
      </div>
    </div>
  );
}

function CardTitle4() {
  return (
    <div className="h-[28px] relative shrink-0 w-[315.336px]" data-name="CardTitle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[28px] items-center relative w-[315.336px]">
        <Icon21 />
        <DispatcherDashboard16 />
      </div>
    </div>
  );
}

function Icon22() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2f84f400} id="Vector" stroke="var(--stroke-0, #51A2FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text30() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-full">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">EMS Units</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="h-[24px] relative shrink-0 w-[108px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[24px] items-center relative w-[108px]">
        <Icon22 />
        <Text30 />
      </div>
    </div>
  );
}

function Badge21() {
  return (
    <div className="bg-[rgba(0,201,80,0.3)] h-[26px] relative rounded-[8px] shrink-0 w-[66.008px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[66.008px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#05df72] text-[12px] text-nowrap whitespace-pre">3 Avail</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge22() {
  return (
    <div className="basis-0 bg-[rgba(240,177,0,0.3)] grow h-[26px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center px-[13px] py-[5px] relative w-full">
          <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#fdc700] text-[12px] text-nowrap whitespace-pre">2 Active</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container85() {
  return (
    <div className="h-[26px] relative shrink-0 w-[148.711px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[26px] items-start relative w-[148.711px]">
        <Badge21 />
        <Badge22 />
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="bg-[rgba(43,127,255,0.1)] h-[52px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(43,127,255,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between px-[13px] py-px relative w-full">
          <Container84 />
          <Container85 />
        </div>
      </div>
    </div>
  );
}

function Icon23() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p1f2a7ea2} id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text31() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-full">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Fire Units</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="h-[24px] relative shrink-0 w-[102.375px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[24px] items-center relative w-[102.375px]">
        <Icon23 />
        <Text31 />
      </div>
    </div>
  );
}

function Badge23() {
  return (
    <div className="bg-[rgba(0,201,80,0.3)] h-[26px] relative rounded-[8px] shrink-0 w-[65.695px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[65.695px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#05df72] text-[12px] text-nowrap whitespace-pre">2 Avail</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge24() {
  return (
    <div className="basis-0 bg-[rgba(240,177,0,0.3)] grow h-[26px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center px-[13px] py-[5px] relative w-full">
          <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#fdc700] text-[12px] text-nowrap whitespace-pre">3 Active</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container88() {
  return (
    <div className="h-[26px] relative shrink-0 w-[148.703px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[26px] items-start relative w-[148.703px]">
        <Badge23 />
        <Badge24 />
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="bg-[rgba(251,44,54,0.1)] h-[52px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between px-[13px] py-px relative w-full">
          <Container87 />
          <Container88 />
        </div>
      </div>
    </div>
  );
}

function Icon24() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p1d27a00} id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text32() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-full">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Police Units</p>
      </div>
    </div>
  );
}

function Container90() {
  return (
    <div className="h-[24px] relative shrink-0 w-[119.414px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[24px] items-center relative w-[119.414px]">
        <Icon24 />
        <Text32 />
      </div>
    </div>
  );
}

function Badge25() {
  return (
    <div className="bg-[rgba(0,201,80,0.3)] h-[26px] relative rounded-[8px] shrink-0 w-[66.008px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center overflow-clip px-[13px] py-[5px] relative w-[66.008px]">
        <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#05df72] text-[12px] text-nowrap whitespace-pre">3 Avail</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,201,80,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge26() {
  return (
    <div className="basis-0 bg-[rgba(240,177,0,0.3)] grow h-[26px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[26px] items-center justify-center px-[13px] py-[5px] relative w-full">
          <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[#fdc700] text-[12px] text-nowrap whitespace-pre">1 Active</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container91() {
  return (
    <div className="h-[26px] relative shrink-0 w-[147.133px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[26px] items-start relative w-[147.133px]">
        <Badge25 />
        <Badge26 />
      </div>
    </div>
  );
}

function Container92() {
  return (
    <div className="bg-[rgba(240,177,0,0.1)] h-[52px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(240,177,0,0.2)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between px-[13px] py-px relative w-full">
          <Container90 />
          <Container91 />
        </div>
      </div>
    </div>
  );
}

function DispatcherDashboard17() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[315.336px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-full items-start relative w-[315.336px]">
        <Container86 />
        <Container89 />
        <Container92 />
      </div>
    </div>
  );
}

function Card11() {
  return (
    <div className="bg-neutral-950 h-[304px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[46px] h-[304px] items-start pl-[25px] pr-px py-[25px] relative w-full">
          <CardTitle4 />
          <DispatcherDashboard17 />
        </div>
      </div>
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p28b1aae0} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard18() {
  return (
    <div className="h-[28px] relative shrink-0 w-[111.219px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[111.219px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">System Alerts</p>
      </div>
    </div>
  );
}

function CardTitle5() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[28px] items-center left-[25px] top-[25px] w-[315.336px]" data-name="CardTitle">
      <Icon25 />
      <DispatcherDashboard18 />
    </div>
  );
}

function Icon26() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1ce4e8c0} id="Vector" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 6V8.66667" id="Vector_2" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 11.3333H8.00667" id="Vector_3" stroke="var(--stroke-0, #FDC700)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph37() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 top-[-0.5px] tracking-[-0.3125px] w-[192px]">Unit AMB-02 low on fuel - returning to base</p>
    </div>
  );
}

function Paragraph38() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">14:30:15</p>
    </div>
  );
}

function Container93() {
  return (
    <div className="basis-0 grow h-[72px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[72px] items-start relative w-full">
        <Paragraph37 />
        <Paragraph38 />
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex gap-[12px] h-[72px] items-start relative shrink-0 w-full" data-name="Container">
      <Icon26 />
      <Container93 />
    </div>
  );
}

function DispatcherDashboard19() {
  return (
    <div className="bg-[rgba(240,177,0,0.1)] h-[108px] relative rounded-[10px] shrink-0 w-full" data-name="DispatcherDashboard">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(240,177,0,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col h-[108px] items-start pb-[2px] pt-[18px] px-[18px] relative w-full">
          <Container94 />
        </div>
      </div>
    </div>
  );
}

function Icon27() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_736)" id="Icon">
          <path d={svgPaths.p2d09d900} id="Vector" stroke="var(--stroke-0, #51A2FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_736">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Paragraph39() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 top-[-0.5px] tracking-[-0.3125px] w-[230px]">Agent processing completed in 4.2s - within target</p>
    </div>
  );
}

function Paragraph40() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">14:35:20</p>
    </div>
  );
}

function Container95() {
  return (
    <div className="basis-0 grow h-[72px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[72px] items-start relative w-full">
        <Paragraph39 />
        <Paragraph40 />
      </div>
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex gap-[12px] h-[72px] items-start relative shrink-0 w-full" data-name="Container">
      <Icon27 />
      <Container95 />
    </div>
  );
}

function DispatcherDashboard20() {
  return (
    <div className="bg-[rgba(43,127,255,0.1)] h-[108px] relative rounded-[10px] shrink-0 w-full" data-name="DispatcherDashboard">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(43,127,255,0.3)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col h-[108px] items-start pb-[2px] pt-[18px] px-[18px] relative w-full">
          <Container96 />
        </div>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[110.06px] not-italic text-[14px] text-neutral-50 text-nowrap top-[10.5px] tracking-[-0.1504px] whitespace-pre">View All Alerts</p>
    </div>
  );
}

function CardContent5() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[16px] h-[320px] items-start left-px px-[24px] py-0 top-[99px] w-[363.336px]" data-name="CardContent">
      <DispatcherDashboard19 />
      <DispatcherDashboard20 />
      <Button12 />
    </div>
  );
}

function Card12() {
  return (
    <div className="bg-neutral-950 h-[420px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardTitle5 />
      <CardContent5 />
    </div>
  );
}

function Icon28() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p79ef280} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M21.854 2.147L10.914 13.086" id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function DispatcherDashboard21() {
  return (
    <div className="h-[28px] relative shrink-0 w-[110.867px]" data-name="DispatcherDashboard">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[110.867px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Quick Actions</p>
      </div>
    </div>
  );
}

function CardTitle6() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[28px] items-center left-[25px] top-[25px] w-[315.336px]" data-name="CardTitle">
      <Icon28 />
      <DispatcherDashboard21 />
    </div>
  );
}

function Icon29() {
  return (
    <div className="absolute left-[17px] size-[16px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_788)" id="Icon">
          <path d={svgPaths.p26187580} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_788">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon29 />
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[53px] not-italic text-[16px] text-neutral-50 text-nowrap top-[11.5px] tracking-[-0.3125px] whitespace-pre">Manual Dispatch</p>
    </div>
  );
}

function Icon30() {
  return (
    <div className="absolute left-[17px] size-[16px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p32887f80} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3b6ee540} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p188b8380} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3694d280} id="Vector_4" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon30 />
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[53px] not-italic text-[16px] text-neutral-50 text-nowrap top-[11.5px] tracking-[-0.3125px] whitespace-pre">Unit Reassignment</p>
    </div>
  );
}

function Icon31() {
  return (
    <div className="absolute left-[17px] size-[16px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_732)" id="Icon">
          <path d={svgPaths.p3eaa2980} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f2c5400} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_5_732">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon31 />
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[53px] not-italic text-[16px] text-neutral-50 text-nowrap top-[11.5px] tracking-[-0.3125px] whitespace-pre">Override Verification</p>
    </div>
  );
}

function CardContent6() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[12px] h-[192px] items-start left-px px-[24px] py-0 top-[99px] w-[363.336px]" data-name="CardContent">
      <Button13 />
      <Button14 />
      <Button15 />
    </div>
  );
}

function Card13() {
  return (
    <div className="bg-neutral-950 h-[292px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <CardTitle6 />
      <CardContent6 />
    </div>
  );
}

function Container97() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[1576px] items-start left-[794.66px] top-0 w-[365.336px]" data-name="Container">
      <Card10 />
      <Card11 />
      <Card12 />
      <Card13 />
    </div>
  );
}

function Container98() {
  return (
    <div className="h-[1576px] relative shrink-0 w-full" data-name="Container">
      <Card9 />
      <Container97 />
    </div>
  );
}

function DispatcherDashboard22() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] h-[2344px] items-start relative shrink-0 w-full" data-name="DispatcherDashboard">
      <Card4 />
      <Card5 />
      <Container98 />
    </div>
  );
}

function Container99() {
  return (
    <div className="basis-0 grow h-[2622px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="overflow-clip relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-[2622px] items-start pb-0 pt-[24px] px-[24px] relative w-full">
          <Container25 />
          <Container42 />
          <DispatcherDashboard22 />
        </div>
      </div>
    </div>
  );
}

function App13() {
  return (
    <div className="bg-neutral-950 content-stretch flex h-[2622px] items-start relative shrink-0 w-full" data-name="App">
      <Container22 />
      <Container99 />
    </div>
  );
}

export default function MhacksFirefly() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Mhacks Firefly">
      <App13 />
    </div>
  );
}