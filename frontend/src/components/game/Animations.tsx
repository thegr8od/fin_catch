import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

// 이미지 캐시 객체 추가
const imageCache: Record<string, HTMLImageElement> = {};

// 이미지 사전 로딩 함수
const preloadImages = (sources: string[]): Promise<HTMLImageElement[]> => {
  const promises = sources.map((src) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
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
  });

  return Promise.all(promises);
};

interface AnimationProps {
  isPlaying: boolean;
  imagePaths: string[]; // 이미지 경로 배열
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
}

const Animation: React.FC<AnimationProps> = ({
  isPlaying,
  imagePaths,
  animationSpeed = 0.2,
  onAnimationComplete,
  onHitLeft,
  onHitRight,
  direction = true, // 기본값은 왼쪽에서 오른쪽
  width = 800,
  height = 600,
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
    const loadImages = async () => {
      try {
        await preloadImages(imagePaths);
        setIsLoaded(true);
      } catch (error) {
        console.error("이미지 로딩 실패:", error);
      }
    };

    loadImages();
  }, [imagePaths]);

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
    canvas.width = containerWidthRef.current;
    canvas.height = containerHeightRef.current;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none"; // 마우스 이벤트 무시
    canvas.style.zIndex = "100"; // z-index 값을 높여서 다른 요소 위에 표시
    canvas.style.backgroundColor = "transparent"; // 배경 투명하게 설정

    // 컨테이너에 캔버스 추가
    containerRef.current.appendChild(canvas);

    // PixiJS 앱 생성 - WebGL 렌더러 설정 최적화
    const app = new PIXI.Application({
      width: containerWidthRef.current,
      height: containerHeightRef.current,
      backgroundAlpha: 0,
      // 캔버스 뷰 설정
      view: canvas,
      // 렌더러 설정
      forceCanvas: false, // WebGL 렌더러 사용 (더 나은 성능)
      antialias: true,
      // 해상도 설정
      resolution: window.devicePixelRatio || 1,
      // 자동 렌더링 설정
      autoDensity: true,
      // 렌더링 전 클리어
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

    // 텍스처 배열 생성 - 캐시된 이미지 사용
    console.log("이미지 경로 배열:", imagePaths);

    const textures = imagePaths.map((src) => {
      console.log("이미지 로딩 시도:", src);
      try {
        // 텍스처 캐싱 활성화
        if (PIXI.utils.TextureCache[src]) {
          console.log("캐시된 텍스처 사용:", src);
          return PIXI.utils.TextureCache[src];
        }

        const texture = PIXI.Texture.from(src);
        // 텍스처 캐싱
        texture.baseTexture.cacheId = src;
        PIXI.utils.TextureCache[src] = texture;

        console.log("텍스처 생성 성공:", src);
        return texture;
      } catch (error) {
        console.error("텍스처 생성 실패:", src, error);
        // 오류 발생 시 빈 텍스처 반환
        return PIXI.Texture.EMPTY;
      }
    });

    console.log("텍스처 생성 완료:", textures.length);

    // 애니메이션 스프라이트 생성
    const animation = new PIXI.AnimatedSprite(textures);

    // 애니메이션 설정
    animation.animationSpeed = animationSpeed; // 애니메이션 속도
    animation.loop = false; // 반복 없음

    // 애니메이션 위치 설정
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

    // 앵커 포인트 설정 (중앙)
    animation.anchor.set(0.5);

    // 크기 설정 (더 크게 조정)
    animation.width = 200;
    animation.height = 200;

    // 애니메이션 완료 이벤트
    animation.onComplete = () => {
      console.log("애니메이션 완료");

      // 애니메이션 중지 및 숨기기
      animation.visible = false;
      animation.stop();

      // 애니메이션 참조 제거
      animationRef.current = null;

      // 캔버스 즉시 숨기기
      if (canvas) {
        canvas.style.display = "none";
      }

      // 캔버스 제거 (DOM에서 완전히 제거)
      if (containerRef.current && canvas && containerRef.current.contains(canvas)) {
        try {
          containerRef.current.removeChild(canvas);
        } catch (error) {
          console.error("캔버스 제거 중 오류:", error);
        }
      }

      // 충돌 감지 로직
      if (direction && onHitRight) {
        setTimeout(() => onHitRight(), 0);
      } else if (!direction && onHitLeft) {
        setTimeout(() => onHitLeft(), 0);
      }

      // 애니메이션 완료 콜백
      if (onAnimationComplete) {
        setTimeout(() => onAnimationComplete(), 0);
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
      if (direction) {
        // 왼쪽에서 오른쪽으로
        animation.x += 5; // 이동 속도 증가

        // 오른쪽 끝에 도달했는지 확인
        if (animation.x > (containerWidthRef.current * 3) / 4) {
          // 오른쪽 캐릭터에 부딪혔는지 확인
          if (onHitRight && !hitRightRef.current) {
            hitRightRef.current = true;
            onHitRight();
          }

          // onComplete 메서드가 있는지 확인 후 호출
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      } else {
        // 오른쪽에서 왼쪽으로
        animation.x -= 5; // 이동 속도 증가

        // 왼쪽 끝에 도달했는지 확인
        if (animation.x < containerWidthRef.current / 4) {
          // 왼쪽 캐릭터에 부딪혔는지 확인
          if (onHitLeft && !hitLeftRef.current) {
            hitLeftRef.current = true;
            onHitLeft();
          }

          // onComplete 메서드가 있는지 확인 후 호출
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      }
    };

    // 애니메이션 업데이트 함수 등록
    app.ticker.add(updateAnimation);

    // 애니메이션 자동 시작
    if (isPlaying) {
      console.log("애니메이션 자동 시작");
      animation.play();
    }
  }, [isLoaded, imagePaths, width, height, direction, animationSpeed, isPlaying, onAnimationComplete, onHitLeft, onHitRight]);

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
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default Animation;
