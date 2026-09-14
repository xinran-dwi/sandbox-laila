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
      {/* Mobile                                                            */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex min-h-dvh flex-col bg-page lg:hidden">
        <MobileHeader />
        <ImageStage />
        <InfoBanner />
        <div className="px-5">
          <ActionGrid variant="mobile" />
        </div>
        <div className="mt-auto px-5 pb-4">
          <DownloadButton variant="mobile" />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Desktop                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="hidden h-dvh bg-page lg:flex">
        <DesktopRail />
        <DesktopViewer />
        <DesktopPanel />
      </div>
    </>
  );
}
