import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";

// 이미지 캐시 객체 추가
const imageCache: Record<string, HTMLImageElement> = {};

// 이미지 사전 로딩 함수
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // 이미 캐시에 있으면 바로 반환
    if (imageCache[src]) {
      resolve(imageCache[src]);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

interface SpriteAnimationProps {
  isPlaying: boolean;
  spriteSheet: string; // 스프라이트 시트 이미지 경로
  frameWidth: number; // 각 프레임의 너비
  frameHeight: number; // 각 프레임의 높이
  frameCount: number; // 총 프레임 수
  animationSpeed?: number; // 애니메이션 속도 (기본값: 0.2)
  onAnimationComplete?: () => void;
  // 충돌 감지를 위한 추가 속성
  onHitLeft?: () => void; // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  // 애니메이션 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  direction?: boolean;
  // 애니메이션 크기 설정
  width?: number;
  height?: number;
  // 스프라이트 시트 레이아웃 (true: 가로 배열, false: 세로 배열)
  horizontal?: boolean;
  // 스프라이트 시트의 행 수 (세로 배열일 때 사용)
  rows?: number;
  // 스프라이트 시트의 열 수 (가로 배열일 때 사용)
  columns?: number;
  // 애니메이션 반복 여부
  loop?: boolean;
  // 이동 애니메이션 여부 (false일 경우 제자리 애니메이션)
  moving?: boolean;
}

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({
  isPlaying,
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  animationSpeed = 0.2,
  onAnimationComplete,
  onHitLeft,
  onHitRight,
  direction = true, // 기본값은 왼쪽에서 오른쪽
  width = 800,
  height = 600,
  horizontal = true, // 기본값은 가로 배열
  rows = 1,
  columns = 0, // 0이면 자동 계산
  loop = false, // 기본값은 반복 안 함
  moving = false, // 기본값은 제자리 애니메이션
}) => {
  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement>(null);
  // PixiJS 앱 참조
  const appRef = useRef<PIXI.Application | null>(null);
  // 애니메이션 참조
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  // 초기화 여부 참조
  const initializedRef = useRef<boolean>(false);
  // 재생 상태 참조
  const isPlayingRef = useRef<boolean>(false);
  // 충돌 감지 참조
  const hitRightRef = useRef<boolean>(false);
  const hitLeftRef = useRef<boolean>(false);
  // 컨테이너 크기 참조
  const containerWidthRef = useRef<number>(width);
  const containerHeightRef = useRef<number>(height);
  // 로딩 상태 추가
  const [isLoaded, setIsLoaded] = useState(false);

  // 이미지 사전 로딩
  useEffect(() => {
    const loadImage = async () => {
      try {
        await preloadImage(spriteSheet);
        setIsLoaded(true);
      } catch (error) {
        console.error("이미지 로딩 실패:", spriteSheet, error);
      }
    };

    loadImage();
  }, [spriteSheet]);

  // PixiJS 앱 초기화
  useEffect(() => {
    // 이미지가 로드되지 않았거나 이미 초기화되었거나 컨테이너가 없으면 리턴
    if (!isLoaded || initializedRef.current || !containerRef.current) return;

    // 초기화 상태 업데이트
    initializedRef.current = true;

    // 컨테이너 크기 가져오기
    containerWidthRef.current = containerRef.current.clientWidth || width;
    containerHeightRef.current = containerRef.current.clientHeight || height;

    console.log("컨테이너 크기:", containerWidthRef.current, containerHeightRef.current);

    // 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.width = containerWidthRef.current - 4; // 너비를 4px 줄임
    canvas.height = containerHeightRef.current;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "calc(100% - 4px)"; // CSS 너비도 4px 줄임
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none"; // 마우스 이벤트 무시
    canvas.style.zIndex = "100"; // z-index 값을 높여서 다른 요소 위에 표시
    canvas.style.backgroundColor = "transparent"; // 배경 투명

    // 컨테이너에 캔버스 추가
    containerRef.current.appendChild(canvas);

    // PixiJS 앱 생성 - WebGL 렌더러 설정 최적화
    const app = new PIXI.Application({
      width: containerWidthRef.current - 4, // 너비를 4px 줄임
      height: containerHeightRef.current,
      backgroundAlpha: 0,
      view: canvas,
      forceCanvas: false,
      antialias: false, // 안티앨리어싱 비활성화 (픽셀 아트에 적합)
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      clearBeforeRender: true,
      powerPreference: "high-performance", // 고성능 GPU 사용 요청
    });

    // 렌더러에 투명도 설정 추가
    if (app.renderer) {
      // 타입 안전하게 처리하기 위해 unknown으로 캐스팅 후 접근
      const renderer = app.renderer as unknown;
      // 속성 접근 및 설정
      if (renderer) {
        // 객체로 타입 단언 후 속성 설정
        const rendererObj = renderer as Record<string, unknown>;
        // 타입 안전하게 속성 설정
        if (typeof rendererObj.backgroundColor !== "undefined") {
          (rendererObj as Record<string, number>).backgroundColor = 0x000000;
        }
        if (typeof rendererObj.backgroundAlpha !== "undefined") {
          (rendererObj as Record<string, number>).backgroundAlpha = 0;
        }
      }
    }

    appRef.current = app;

    // 캔버스 컨텍스트에 투명도 설정 (필요한 경우)
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.globalAlpha = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 스프라이트 시트 로드 - 캐시된 이미지 사용
    console.log("스프라이트 시트 로드 시도:", spriteSheet);

    // 캐시된 이미지를 사용하여 베이스 텍스처 생성
    const baseTexture = PIXI.BaseTexture.from(spriteSheet);

    // 텍스처 캐싱 활성화
    baseTexture.cacheId = spriteSheet;
    PIXI.utils.TextureCache[spriteSheet] = new PIXI.Texture(baseTexture);

    // 기본 텍스처 설정
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // 픽셀 아트에 적합한 설정

    const textures: PIXI.Texture[] = [];

    // 열 수 계산 (가로 배열일 때)
    const calculatedColumns = columns > 0 ? columns : Math.ceil(frameCount / rows);

    // 스프라이트 시트에서 각 프레임의 텍스처 추출
    for (let i = 0; i < frameCount; i++) {
      let x, y;

      if (horizontal) {
        // 가로 배열 (행 우선)
        x = (i % calculatedColumns) * frameWidth;
        y = Math.floor(i / calculatedColumns) * frameHeight;
      } else {
        // 세로 배열 (열 우선)
        x = Math.floor(i / rows) * frameWidth;
        y = (i % rows) * frameHeight;
      }

      // 프레임 경계에 약간의 여백 추가 (1px)
      const padding = 1;
      const rect = new PIXI.Rectangle(x + padding, y + padding, frameWidth - padding * 2, frameHeight - padding * 2);

      const texture = new PIXI.Texture(baseTexture, rect);

      // 텍스처 스케일링 모드 설정 (픽셀 아트에 적합한 설정)
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

      textures.push(texture);

      console.log(`프레임 ${i + 1} 텍스처 생성:`, x + padding, y + padding, frameWidth - padding * 2, frameHeight - padding * 2);
    }

    console.log("텍스처 생성 완료:", textures.length);

    // 애니메이션 스프라이트 생성
    const animation = new PIXI.AnimatedSprite(textures);

    // 애니메이션 설정
    animation.animationSpeed = animationSpeed; // 애니메이션 속도
    animation.loop = loop; // 반복 여부

    // 픽셀 아트에 적합한 설정 (더 선명한 이미지)
    animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    // 애니메이션 위치 설정
    if (moving) {
      // 이동 애니메이션인 경우
      if (direction) {
        // 왼쪽에서 오른쪽으로
        animation.x = containerWidthRef.current / 4; // 시작 위치를 화면 안쪽으로 조정
        animation.y = containerHeightRef.current / 2; // 중앙 높이
      } else {
        // 오른쪽에서 왼쪽으로
        animation.x = (containerWidthRef.current * 3) / 4; // 시작 위치를 화면 안쪽으로 조정
        animation.y = containerHeightRef.current / 2; // 중앙 높이
        animation.scale.x = -1; // 수평 반전
      }
    } else {
      // 제자리 애니메이션인 경우
      animation.x = containerWidthRef.current / 2; // 중앙 위치
      animation.y = containerHeightRef.current / 2; // 중앙 높이

      // 방향에 따라 수평 반전
      if (!direction) {
        animation.scale.x = -1; // 수평 반전
      }
    }

    // 앵커 포인트 설정 (중앙)
    animation.anchor.set(0.5);

    // 크기 설정
    // 원본 크기와 컨테이너 크기의 비율을 계산하여 적절한 크기 설정
    const scaleX = containerWidthRef.current / frameWidth;
    const scaleY = containerHeightRef.current / frameHeight;
    const scale = Math.min(scaleX, scaleY) * 0.6; // 60%로 축소하여 여백 확보

    // 너무 큰 스케일링은 픽셀화를 악화시키므로 최대값 제한
    const maxScale = 3.0; // 최대 3배까지만 확대

    // 픽셀 아트는 정수 배수로 스케일링할 때 가장 선명함
    // 가장 가까운 정수 배수로 반올림
    const integerScale = Math.floor(Math.min(scale, maxScale));

    // 최소 1배 이상 확대
    const finalScale = Math.max(integerScale, 1);

    animation.width = frameWidth * finalScale;
    animation.height = frameHeight * finalScale;

    console.log("애니메이션 크기 설정:", {
      containerWidth: containerWidthRef.current,
      containerHeight: containerHeightRef.current,
      frameWidth,
      frameHeight,
      scaleX,
      scaleY,
      scale,
      integerScale,
      finalScale,
      finalWidth: animation.width,
      finalHeight: animation.height,
    });

    // 애니메이션 완료 이벤트
    animation.onComplete = () => {
      console.log("애니메이션 완료");

      // 반복 설정이 아닌 경우에만 처리
      if (!loop) {
        // 애니메이션 완료 콜백
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };

    // 앱에 애니메이션 추가
    app.stage.addChild(animation);

    // 애니메이션 참조 저장
    animationRef.current = animation;

    // 애니메이션 업데이트 함수
    const updateAnimation = () => {
      if (!animation || !app) return;

      // 애니메이션 이동
      if (moving) {
        if (direction) {
          // 왼쪽에서 오른쪽으로
          animation.x += 3; // 이동 속도

          // 오른쪽 끝에 도달했는지 확인
          if (animation.x > (containerWidthRef.current * 3) / 4) {
            // 오른쪽 캐릭터에 부딪혔는지 확인
            if (onHitRight && !hitRightRef.current) {
              hitRightRef.current = true;
              onHitRight();
            }
          }
        } else {
          // 오른쪽에서 왼쪽으로
          animation.x -= 3; // 이동 속도

          // 왼쪽 끝에 도달했는지 확인
          if (animation.x < containerWidthRef.current / 4) {
            // 왼쪽 캐릭터에 부딪혔는지 확인
            if (onHitLeft && !hitLeftRef.current) {
              hitLeftRef.current = true;
              onHitLeft();
            }
          }
        }
      }
    };

    // 이동 애니메이션인 경우 업데이트 함수 등록
    if (moving) {
      app.ticker.add(updateAnimation);
    }

    // 애니메이션 자동 시작
    if (isPlaying) {
      console.log("애니메이션 자동 시작");
      animation.play();
    }
  }, [
    isLoaded,
    spriteSheet,
    frameWidth,
    frameHeight,
    frameCount,
    width,
    height,
    horizontal,
    rows,
    columns,
    loop,
    moving,
    direction,
    animationSpeed,
    isPlaying,
    onAnimationComplete,
    onHitLeft,
    onHitRight,
  ]);

  // 애니메이션 재생 상태 변경 시
  useEffect(() => {
    // 애니메이션 참조가 없으면 리턴
    if (!animationRef.current) return;

    // 재생 상태 업데이트
    isPlayingRef.current = isPlaying;

    if (isPlaying) {
      console.log("애니메이션 재생 시작");
      // 애니메이션 재생
      animationRef.current.play();
    } else {
      console.log("애니메이션 재생 중지");
      // 애니메이션 중지
      animationRef.current.stop();
    }
  }, [isPlaying]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 애니메이션 참조 정리
      if (animationRef.current) {
        try {
          animationRef.current.stop();
          animationRef.current.destroy();
        } catch (error) {
          console.error("애니메이션 정리 중 오류:", error);
        }
        animationRef.current = null;
      }

      // 앱 정리
      if (appRef.current) {
        try {
          // 렌더러 정리
          if (appRef.current.renderer) {
            appRef.current.renderer.destroy(true);
          }

          // 스테이지 정리
          if (appRef.current.stage && appRef.current.stage.children) {
            // 스테이지의 모든 자식 요소 제거
            while (appRef.current.stage.children && appRef.current.stage.children.length > 0) {
              const child = appRef.current.stage.children[0];
              if (child) {
                appRef.current.stage.removeChild(child);
                if (typeof child.destroy === "function") {
                  child.destroy(true);
                }
              }
            }
            appRef.current.stage.destroy(true);
          }

          // 앱 정리
          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (error) {
          console.error("앱 정리 중 오류:", error);
        }
        appRef.current = null;
      }

      // 캔버스 제거
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        if (canvas) {
          try {
            containerRef.current.removeChild(canvas);
          } catch (error) {
            console.error("캔버스 제거 중 오류:", error);
          }
        }
      }

      // 초기화 상태 리셋
      initializedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default SpriteAnimation;
