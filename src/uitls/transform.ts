import WorkerCompress from "@/uitls/WorkerCompress?worker";
import WorkerPreview from "@/uitls/WorkerPreview?worker";
import { ImageInfo } from "./ImageInfo";
import { homeState } from "@/states/home";
import { toJS } from "mobx";

interface WorkerManager {
  compress?: Worker;
  preview?: Worker;
}

const worker: WorkerManager = {
  compress: undefined,
  preview: undefined,
};

function onMessage(event: MessageEvent<ImageInfo>) {
  if (homeState.list.has(event.data.key)) {
    const info: ImageInfo = toJS(homeState.list.get(event.data.key)!);
    info.preview = event.data.preview ?? info.preview;
    info.output = event.data.output ?? info.output;
    homeState.list.set(event.data.key, info);
  }
}

/**
 * 初始化Worker，只初始化时调用一次
 * @returns
 */
export function setTransformData() {
  worker.compress = new WorkerCompress();
  worker.preview = new WorkerPreview();
  worker.compress.addEventListener("message", onMessage);
  worker.preview.addEventListener("message", onMessage);

  return () => {
    worker.compress!.removeEventListener("message", onMessage);
    worker.preview!.removeEventListener("message", onMessage);
    worker.compress!.terminate();
    worker.preview!.terminate();
    worker.compress = undefined;
    worker.preview = undefined;
  };
}

/**
 * 添加到worker进行压缩
 * @param info
 */
export function sendToCreateCompress(info: ImageInfo) {
  worker.compress?.postMessage(info);
}

/**
 * 添加到worker生成预览图
 * @param info
 */
export function sendToCreatePreview(info: ImageInfo) {
  worker.preview?.postMessage(info);
}
