
// خدمة مساعدة للتعامل مع العمليات الزمنية
export const timeService = {
  // تحويل الوقت من الخادم إلى ثواني
  parseServerTime: (timeValue, defaultMinutes = 60) => {
    if (!timeValue && timeValue !== 0) {
      return defaultMinutes * 60;
    }
    
    // إذا كان الوقت عبارة عن سلسلة نصية
    if (typeof timeValue === 'string') {
      // معالجة التنسيق ISO أو تنسيق الوقت
      if (timeValue.includes(':')) {
        // تنسيق الوقت مثل "01:30:00"
        const parts = timeValue.split(':');
        if (parts.length === 3) {
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
      
      // محاولة التحليل كتاريخ
      const date = new Date(timeValue);
      if (!isNaN(date.getTime())) {
        return Math.floor((date - new Date()) / 1000);
      }
      
      // محاولة التحقق إذا كان رقمًا في سلسلة نصية
      const numericValue = parseInt(timeValue);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
    
    // إذا كان الوقت رقمًا
    if (typeof timeValue === 'number') {
      // إذا كان الرقم كبيرًا جدًا (محتمل أنه مللي ثانية)
      if (timeValue > 86400000) {
        return Math.floor(timeValue / 1000);
      }
      // إذا كان الرقم معقولاً كثواني
      else if (timeValue <= 86400) {
        return timeValue;
      }
      // إذا كان الرقم بالدقائق (افتراضاً)
      else {
        return timeValue * 60;
      }
    }
    
    // القيمة الافتراضية إذا فشل كل شيء
    return defaultMinutes * 60;
  },
  
  // تنسيق الوقت للعرض
  formatTimeForDisplay: (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  },
  
  // التحقق من صلاحية الوقت
  isValidTime: (timeValue) => {
    return timeValue !== null && timeValue !== undefined && !isNaN(timeValue) && timeValue >= 0;
  }
};

export default timeService;