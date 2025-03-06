import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

// 불꽃 이미지 경로
import fire1 from '../assets/fire/FE6001_01.png';
import fire2 from '../assets/fire/FE6001_02.png';
import fire3 from '../assets/fire/FE6001_03.png';
import fire4 from '../assets/fire/FE6001_04.png';
import fire5 from '../assets/fire/FE6001_05.png';

interface FireAnimationProps {
  isPlaying: boolean;
  onAnimationComplete?: () => void;
  // 충돌 감지를 위한 추가 속성
  onHitLeft?: () => void;  // 왼쪽 캐릭터에 부딪혔을 때 호출될 함수
  onHitRight?: () => void; // 오른쪽 캐릭터에 부딪혔을 때 호출될 함수
  // 불꽃 방향 (true: 왼쪽에서 오른쪽, false: 오른쪽에서 왼쪽)
  direction?: boolean;
}

// PixiJS로 구현
const FireAnimation: React.FC<FireAnimationProps> = ({ 
  isPlaying, 
  onAnimationComplete,
  onHitLeft,
  onHitRight,
  direction = true // 기본값은 왼쪽에서 오른쪽
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animationRef = useRef<PIXI.AnimatedSprite | null>(null);
  const initializedRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const [showCanvas, setShowCanvas] = useState<boolean>(false);
  
  // PixiJS 앱 초기화
  useEffect(() => {
    // 컴포넌트가 마운트된 후 약간의 지연을 두고 초기화
    const initTimer = setTimeout(() => {
      if (initializedRef.current || !containerRef.current) return;
      
      try {
        console.log("PixiJS 앱 초기화 시작");
        
        // 캔버스 엘리먼트 생성
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        canvas.className = "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2";
        canvas.style.background = 'transparent';
        canvas.style.backgroundColor = 'transparent';
        canvas.style.border = 'none';
        canvas.style.outline = 'none';
        
        // 컨테이너에 캔버스 추가
        if (containerRef.current) {
          containerRef.current.appendChild(canvas);
          canvasRef.current = canvas;
        }
        
        // PixiJS 앱 생성
        const app = new PIXI.Application({
          width: 600,
          height: 300,
          // 투명 배경 설정
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
          clearBeforeRender: true
        });
        
        // 렌더러에 투명도 설정 추가
        if (app.renderer) {
          // @ts-ignore - 타입 오류 무시
          app.renderer.backgroundColor = 0x000000;
          // @ts-ignore - 타입 오류 무시
          app.renderer.backgroundAlpha = 0;
        }
        
        appRef.current = app;
        
        // 캔버스 컨텍스트에 투명도 설정 (필요한 경우)
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.globalAlpha = 0;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // 불꽃 이미지 배열
        const fireImages = [fire1, fire2, fire3, fire4, fire5];
        
        // 텍스처 배열 생성
        const textures = fireImages.map(src => {
          // 텍스처 생성 시 이미지 경로 직접 사용
          return PIXI.Texture.from(src);
        });
        
        console.log("텍스처 생성 완료:", textures.length);
        
        // 애니메이션 스프라이트 생성
        const fireAnimation = new PIXI.AnimatedSprite(textures);
        
        // 애니메이션 설정
        fireAnimation.anchor.set(0.5);
        fireAnimation.x = direction ? 100 : app.screen.width - 100;
        fireAnimation.y = app.screen.height / 2;
        fireAnimation.width = 200;
        fireAnimation.height = 200;
        fireAnimation.animationSpeed = 0.1;
        fireAnimation.loop = false;
        fireAnimation.visible = false;
        fireAnimation.scale.x = direction ? 1 : -1; // 방향에 따라 좌우 반전
        // 투명도 설정
        fireAnimation.alpha = 1;
        // 블렌드 모드 설정 (ADD는 더 밝고 투명한 효과)
        fireAnimation.blendMode = PIXI.BLEND_MODES.ADD;
        
        console.log("애니메이션 스프라이트 생성 완료");
        
        // 애니메이션 완료 이벤트
        fireAnimation.onComplete = () => {
          console.log("애니메이션 완료");
          
          // 애니메이션 중지 및 숨기기
          fireAnimation.visible = false;
          fireAnimation.stop();
          
          // 캔버스 즉시 숨기기
          if (canvas) {
            canvas.style.display = 'none';
          }
          
          // 캔버스 제거 (DOM에서 완전히 제거)
          if (containerRef.current && canvas && containerRef.current.contains(canvas)) {
            containerRef.current.removeChild(canvas);
          }
          
          // 상태 업데이트는 비동기적으로 처리
          setShowCanvas(false);
          
          // 충돌 감지 로직
          if (direction && onHitRight) {
            setTimeout(() => onHitRight(), 0); // 렌더링 사이클 외부에서 실행
          } else if (!direction && onHitLeft) {
            setTimeout(() => onHitLeft(), 0); // 렌더링 사이클 외부에서 실행
          }
          
          // 애니메이션 완료 콜백
          if (onAnimationComplete) {
            setTimeout(() => onAnimationComplete(), 0); // 렌더링 사이클 외부에서 실행
          }
        };
        
        // 스테이지에 추가
        app.stage.addChild(fireAnimation);
        animationRef.current = fireAnimation;
        
        // 애니메이션 업데이트 함수 설정
        app.ticker.add(() => {
          if (!animationRef.current || !isPlayingRef.current) return;
          
          // 불꽃 이동 애니메이션
          const moveStep = direction ? 8 : -8;
          animationRef.current.x += moveStep;
          
          // 화면 경계 체크
          const reachedEnd = direction 
            ? animationRef.current.x > app.screen.width - 100
            : animationRef.current.x < 100;
            
          if (reachedEnd && animationRef.current.playing) {
            // 애니메이션이 끝까지 이동했지만 아직 재생 중이면 강제로 완료 처리
            if (typeof animationRef.current.onComplete === 'function') {
              animationRef.current.onComplete();
            }
            animationRef.current.stop();
          }
          
          // 충돌 감지 로직 추가
          const leftBoundary = 150; // 왼쪽 캐릭터 위치 근처
          const rightBoundary = app.screen.width - 150; // 오른쪽 캐릭터 위치 근처
          
          if (direction && animationRef.current.x >= rightBoundary && onHitRight) {
            // 오른쪽으로 이동 중이고 오른쪽 경계에 도달
            animationRef.current.stop();
            if (typeof animationRef.current.onComplete === 'function') {
              animationRef.current.onComplete();
            }
          } else if (!direction && animationRef.current.x <= leftBoundary && onHitLeft) {
            // 왼쪽으로 이동 중이고 왼쪽 경계에 도달
            animationRef.current.stop();
            if (typeof animationRef.current.onComplete === 'function') {
              animationRef.current.onComplete();
            }
          }
        });
        
        initializedRef.current = true;
        console.log("PixiJS 앱 초기화 완료");
        
        // 초기화 후 바로 isPlaying 상태 확인하여 애니메이션 시작
        if (isPlaying) {
          isPlayingRef.current = true;
          fireAnimation.visible = true;
          setShowCanvas(true);
          fireAnimation.gotoAndPlay(0);
        }
      } catch (error) {
        console.error("PixiJS 초기화 오류:", error);
      }
    }, 100); // 100ms 지연
    
    // 정리 함수
    return () => {
      clearTimeout(initTimer);
      
      // 애니메이션 중지
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current.visible = false;
      }
      
      // PixiJS 앱 정리
      if (appRef.current) {
        try {
          // 티커 중지
          appRef.current.ticker.stop();
          // 스테이지 비우기
          appRef.current.stage.removeChildren();
          // 앱 파괴
          appRef.current.destroy(true, {children: true, texture: true, baseTexture: true});
        } catch (error) {
          console.error("PixiJS 앱 정리 오류:", error);
        }
      }
      
      // 캔버스 제거
      if (containerRef.current && canvasRef.current && containerRef.current.contains(canvasRef.current)) {
        try {
          // 캔버스 스타일 변경으로 즉시 숨기기
          canvasRef.current.style.display = 'none';
          // DOM에서 제거
          containerRef.current.removeChild(canvasRef.current);
        } catch (error) {
          console.error("캔버스 제거 오류:", error);
        }
      }
      
      // 참조 초기화
      appRef.current = null;
      animationRef.current = null;
      canvasRef.current = null;
      initializedRef.current = false;
    };
  }, [direction, onAnimationComplete, onHitLeft, onHitRight, isPlaying]);
  
  // isPlaying 상태 변경 시 애니메이션 제어
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    
    if (!initializedRef.current || !animationRef.current || !appRef.current) {
      console.log("애니메이션 제어 불가: 초기화되지 않음");
      return;
    }
    
    const animation = animationRef.current;
    const app = appRef.current;
    
    try {
      if (isPlaying) {
        console.log("애니메이션 시작");
        
        // 캔버스 표시
        setShowCanvas(true);
        
        // 캔버스가 있으면 표시
        if (canvasRef.current) {
          canvasRef.current.style.display = 'block';
        }
        
        // 방향에 따라 초기 위치 설정
        animation.x = direction ? 100 : app.screen.width - 100;
        animation.y = app.screen.height / 2;
        animation.scale.x = direction ? 1 : -1; // 방향에 따라 좌우 반전
        animation.alpha = 1;
        
        // 애니메이션 시작
        animation.visible = true;
        animation.gotoAndPlay(0);
      } else {
        console.log("애니메이션 중지");
        
        // 애니메이션 중지
        animation.visible = false;
        animation.stop();
        
        // 캔버스 즉시 숨기기
        if (canvasRef.current) {
          canvasRef.current.style.display = 'none';
        }
        
        // 캔버스 제거 (DOM에서 완전히 제거)
        if (containerRef.current && canvasRef.current && containerRef.current.contains(canvasRef.current)) {
          containerRef.current.removeChild(canvasRef.current);
          canvasRef.current = null;
        }
        
        // 캔버스 숨기기 (상태 업데이트)
        setShowCanvas(false);
      }
    } catch (error) {
      console.error("애니메이션 제어 오류:", error);
    }
  }, [isPlaying, direction]);
  
  // 항상 컨테이너를 렌더링하고, showCanvas 상태에 따라 내부 캔버스 표시 여부 결정
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute inset-0 pointer-events-none z-20"
      style={{ 
        overflow: 'visible',
        background: 'transparent',
        backgroundColor: 'transparent'
      }}
    >
      {/* 캔버스는 동적으로 생성하고 추가하므로 여기서는 렌더링하지 않음 */}
    </div>
  );
};

export default FireAnimation;