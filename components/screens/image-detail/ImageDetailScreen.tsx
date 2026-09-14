import { ActionGrid } from "./ActionGrid";
import { DesktopPanel } from "./DesktopPanel";
import { DesktopRail } from "./DesktopRail";
import { DesktopViewer } from "./DesktopViewer";
import { DownloadButton } from "./DownloadButton";
import { ImageStage } from "./ImageStage";
import { InfoBanner } from "./InfoBanner";
import { MobileHeader } from "./MobileHeader";

export function ImageDetailScreen() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Mobile — 390 x 844                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="surface-page flex min-h-dvh flex-col lg:hidden">
        <MobileHeader />
        <ImageStage />
        <InfoBanner />
        <div className="px-[21px]">
          <ActionGrid variant="mobile" />
        </div>
        {/* CTA measured at y774-827, 17px above the bottom edge */}
        <div className="mt-auto px-5 pb-[17px]">
          <DownloadButton variant="mobile" />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Desktop — 1440 x 931: rail 72, viewer 867, panel 501              */}
      {/* ---------------------------------------------------------------- */}
      <div className="hidden h-dvh bg-viewer lg:flex">
        <DesktopRail />
        <DesktopViewer />
        <DesktopPanel />
      </div>
    </>
  );
}
