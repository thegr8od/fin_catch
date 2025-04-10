// src/utils/EventEmitter.ts

/**
 * 이벤트 발생 및 구독을 관리하는 클래스
 * 이벤트 기반 아키텍처를 구현하기 위한 기본 클래스
 *
 * 주요 기능:
 * - 이벤트 구독 (on)
 * - 이벤트 구독 해제 (off)
 * - 이벤트 발생 (emit)
 * - 모든 이벤트 리스너 제거 (removeAllListeners)
 */
export class EventEmitter {
  /**
   * 이벤트와 콜백 함수를 저장하는 객체
   * key: 이벤트 이름
   * value: 해당 이벤트에 등록된 콜백 함수 배열
   */
  private events: { [key: string]: Function[] } = {};

  /**
   * 특정 이벤트에 대한 콜백 함수를 등록
   * @param event 구독할 이벤트 이름
   * @param callback 이벤트 발생 시 실행할 콜백 함수
   */
  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * 특정 이벤트에 대한 콜백 함수를 제거
   * @param event 구독 해제할 이벤트 이름
   * @param callback 제거할 콜백 함수
   */
  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  /**
   * 특정 이벤트를 발생시키고 등록된 모든 콜백 함수를 실행
   * @param event 발생시킬 이벤트 이름
   * @param data 이벤트와 함께 전달할 데이터 (선택적)
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }

  /**
   * 이벤트 리스너를 제거
   * @param event 제거할 이벤트 이름 (지정하지 않으면 모든 이벤트 리스너 제거)
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}
