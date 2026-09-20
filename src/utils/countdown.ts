export function initCountdowns(): void {
  // 如果 DOM 已经加载完成，直接初始化
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // 使用 requestAnimationFrame 确保在下一帧执行，给 Astro/框架足够的时间渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initializeAllCountdowns();
      });
    });
  } else {
    // 如果 DOM 还在加载，等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      initializeAllCountdowns();
    });
  }
}

function initializeAllCountdowns(): void {
  initLargeCountdowns();
  initMiniCountdowns();
  initNormalCountdowns();
}

function initLargeCountdowns(): void {
  const largeCountdownWraps = document.querySelectorAll<HTMLElement>('.large-countdown-wrap');
  
  largeCountdownWraps.forEach(wrap => {
    if (wrap.dataset.countdownInitialized === 'true') return;
    wrap.dataset.countdownInitialized = 'true';

    const targetStr = wrap.dataset.target;
    const onGoingText = wrap.dataset.ongoing || '主包正在逛展位';
    const passedText = wrap.dataset.passed || '';
    
    if (!targetStr) return;

    const dateParts = targetStr.split(' ');
    const datePart = dateParts[0];
    const timePart = dateParts[1] || '00:00:00';
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
    
    const targetDate = new Date(year, month - 1, day, hour, minute, second);
    const targetTime = targetDate.getTime();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function updateDisplay() {
      const now = new Date();
      const nowTime = now.getTime();
      const diff = targetTime - nowTime;
      
      const isToday = now.getFullYear() === year && 
                     now.getMonth() === month - 1 && 
                     now.getDate() === day;

      if (diff <= 0) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        const passedDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        const showOngoing = isToday && diff >= -1000 * 60 * 60 * 24;
        
        if (showOngoing) {
          wrap.innerHTML = `<span class="large-countdown-text">${onGoingText}</span>`;
        } else if (passedText) {
          const text = passedText.replace('{days}', String(passedDays));
          wrap.innerHTML = `<span class="large-countdown-text">${text}</span>`;
        } else {
          wrap.innerHTML = `<span class="large-countdown-text">已经过去</span><span class="large-countdown-number">${passedDays}</span><span class="large-countdown-text">天</span>`;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      wrap.innerHTML = `
        <span class="large-countdown-text text-[var(--primary)]">还有</span>
        <span class="large-countdown-number text-[var(--primary)]">${days}</span>
        <span class="large-countdown-text text-[var(--primary)]">天</span>
      `;
    }

    updateDisplay();
    intervalId = setInterval(updateDisplay, 1000);
  });
}

function initMiniCountdowns(): void {
  const miniCountdownWraps = document.querySelectorAll<HTMLElement>('.mini-countdown-wrap');
  
  miniCountdownWraps.forEach(wrap => {
    if (wrap.dataset.countdownInitialized === 'true') return;
    wrap.dataset.countdownInitialized = 'true';

    const targetStr = wrap.dataset.target;
    const onGoingText = wrap.dataset.ongoing || '主包正在逛展位';
    const passedText = wrap.dataset.passed || '';
    
    if (!targetStr) return;

    const dateParts = targetStr.split(' ');
    const datePart = dateParts[0];
    const timePart = dateParts[1] || '00:00:00';
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
    
    const targetDate = new Date(year, month - 1, day, hour, minute, second);
    const targetTime = targetDate.getTime();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function updateDisplay() {
      const now = new Date();
      const nowTime = now.getTime();
      const diff = targetTime - nowTime;
      
      const isToday = now.getFullYear() === year && 
                     now.getMonth() === month - 1 && 
                     now.getDate() === day;

      if (diff <= 0) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        const passedDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        const showOngoing = isToday && diff >= -1000 * 60 * 60 * 24;
        
        if (showOngoing) {
          wrap.innerHTML = `<span class="mini-countdown-item"><span class="mini-countdown-num" style="color: var(--primary); min-width: auto;">${onGoingText}</span></span>`;
        } else if (passedText) {
          const text = passedText.replace('{days}', String(passedDays));
          wrap.innerHTML = `<span class="mini-countdown-item"><span class="mini-countdown-num" style="color: var(--content-meta); min-width: auto;">${text}</span></span>`;
        } else {
          wrap.innerHTML = `<span class="mini-countdown-item"><span class="mini-countdown-num" style="color: var(--content-meta); min-width: auto;">已过去 ${passedDays} 天</span></span>`;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      wrap.innerHTML = `
        <span class="mini-countdown-item"><span class="mini-countdown-num">${days}</span><span class="mini-countdown-label">天</span></span>
        <span class="mini-countdown-sep">:</span>
        <span class="mini-countdown-item"><span class="mini-countdown-num">${String(hours).padStart(2, '0')}</span><span class="mini-countdown-label">时</span></span>
        <span class="mini-countdown-sep">:</span>
        <span class="mini-countdown-item"><span class="mini-countdown-num">${String(minutes).padStart(2, '0')}</span><span class="mini-countdown-label">分</span></span>
        <span class="mini-countdown-sep">:</span>
        <span class="mini-countdown-item"><span class="mini-countdown-num">${String(seconds).padStart(2, '0')}</span><span class="mini-countdown-label">秒</span></span>
      `;
    }

    updateDisplay();
    intervalId = setInterval(updateDisplay, 1000);
  });
}

function initNormalCountdowns(): void {
  const countdownWraps = document.querySelectorAll<HTMLElement>('.countdown-wrap');
  
  countdownWraps.forEach(wrap => {
    if (wrap.dataset.countdownInitialized === 'true') return;
    wrap.dataset.countdownInitialized = 'true';

    const targetStr = wrap.dataset.target;
    const onGoingText = wrap.dataset.ongoing || '主包正在逛展位';
    const passedText = wrap.dataset.passed || '';
    
    if (!targetStr) return;

    const dateParts = targetStr.split(' ');
    const datePart = dateParts[0];
    const timePart = dateParts[1] || '00:00:00';
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
    
    const targetDate = new Date(year, month - 1, day, hour, minute, second);
    const targetTime = targetDate.getTime();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function updateDisplay() {
      const now = new Date();
      const nowTime = now.getTime();
      const diff = targetTime - nowTime;
      
      const isToday = now.getFullYear() === year && 
                     now.getMonth() === month - 1 && 
                     now.getDate() === day;

      if (diff <= 0) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        const passedDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        const showOngoing = isToday && diff >= -1000 * 60 * 60 * 24;
        
        if (showOngoing) {
          wrap.innerHTML = `<div class="countdown-item"><span class="countdown-number" style="color: var(--primary); font-size: 14px; min-width: auto;">${onGoingText}</span></div>`;
        } else if (passedText) {
          const text = passedText.replace('{days}', String(passedDays));
          wrap.innerHTML = `<div class="countdown-item"><span class="countdown-number" style="color: var(--content-meta); font-size: 14px; min-width: auto;">${text}</span></div>`;
        } else {
          wrap.innerHTML = `<div class="countdown-item"><span class="countdown-number" style="color: var(--content-meta); font-size: 14px; min-width: auto;">已经过去了 ${passedDays} 天</span></div>`;
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      wrap.innerHTML = `
        <div class="countdown-item"><span class="countdown-number">${days}</span><span class="countdown-label">天</span></div>
        <span class="countdown-separator">:</span>
        <div class="countdown-item"><span class="countdown-number">${String(hours).padStart(2, '0')}</span><span class="countdown-label">时</span></div>
        <span class="countdown-separator">:</span>
        <div class="countdown-item"><span class="countdown-number">${String(minutes).padStart(2, '0')}</span><span class="countdown-label">分</span></div>
        <span class="countdown-separator">:</span>
        <div class="countdown-item"><span class="countdown-number">${String(seconds).padStart(2, '0')}</span><span class="countdown-label">秒</span></div>
      `;
    }

    updateDisplay();
    intervalId = setInterval(updateDisplay, 1000);
  });
}