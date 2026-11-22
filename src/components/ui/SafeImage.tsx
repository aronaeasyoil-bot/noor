"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { fallbackImage } from "@/lib/media";

/** next/image with a neutral travel illustration if the remote photo cannot be loaded. */
export function SafeImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  const { alt, src, ...rest } = props;
  return <Image {...rest} alt={alt} src={failed ? fallbackImage : src} onError={() => setFailed(true)} />;
}
