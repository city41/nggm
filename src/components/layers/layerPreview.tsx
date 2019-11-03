import React from "react";
import { Layer as LayerData } from "../../state/types";
import { layerToDataUrl } from "../../canvas/toDataUrl";

interface LayerPreviewProps {
  layer: LayerData;
}

export const LayerPreview: React.FunctionComponent<
  LayerPreviewProps
> = React.memo<LayerPreviewProps>(({ layer }) => {
  const { width: imgWidth, height: imgHeight, url } = layerToDataUrl(layer);

  const scale = 48 / imgHeight;

  return (
    <img
      width={imgWidth * scale}
      height={imgHeight * scale}
      src={url}
      alt="layer thumbnail"
    />
  );
});
