/**
 * Sistema de Monitorização e Logging de Performance
 * 
 * Fornece logging estruturado e tracking de métricas de performance
 * para diagnóstico e troubleshooting de problemas de timeout.
 */

// Tipos de eventos de logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'query' | 'performance' | 'network';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  event: string;
  data?: Record<string, any>;
  duration?: number;
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Armazenamento de logs e métricas
class MonitoringService {
  private logs: LogEntry[] = [];
  private metrics: Map<string, PerformanceMetric> = new Map();
  private maxLogs = 1000; // Limitar para evitar memory leak
  
  // Thresholds para warnings
  private readonly thresholds = {
    auth: 2000, // 2s para queries de autenticação
    query: 3000, // 3s para queries gerais
    network: 5000, // 5s para requests de rede
  };

  /**
   * Adiciona um log estruturado
   */
  log(
    level: LogLevel,
    category: LogCategory,
    event: string,
    data?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      event,
      data,
    };

    this.logs.push(entry);

    // Limitar tamanho do array
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console com formatação
    const prefix = `[${category.toUpperCase()}]`;
    const message = `${prefix} ${event}`;
    
    switch (level) {
      case 'debug':
        console.debug(message, data || '');
        break;
      case 'info':
        console.info(message, data || '');
        break;
      case 'warn':
        console.warn(message, data || '');
        break;
      case 'error':
        console.error(message, data || '');
        break;
    }
  }

  /**
   * Inicia tracking de performance de uma operação
   */
  startMetric(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });

    this.log('debug', 'performance', `${name}_start`, metadata);
  }

  /**
   * Finaliza tracking de performance e retorna duração
   */
  endMetric(name: string, metadata?: Record<string, any>): number | null {
    const metric = this.metrics.get(name);
    
    if (!metric) {
      this.log('warn', 'performance', `metric_not_found`, { name });
      return null;
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - metric.startTime);

    metric.endTime = endTime;
    metric.duration = duration;

    // Verificar se excede threshold e logar warning
    const category = this.getCategoryFromMetricName(name);
    const threshold = this.thresholds[category] || this.thresholds.query;

    if (duration > threshold) {
      this.log('warn', 'performance', `${name}_slow`, {
        duration,
        threshold,
        ...metadata,
      });
    } else {
      this.log('debug', 'performance', `${name}_end`, {
        duration,
        ...metadata,
      });
    }

    return duration;
  }

  /**
   * Determina categoria a partir do nome da métrica
   */
  private getCategoryFromMetricName(name: string): LogCategory {
    if (name.includes('auth') || name.includes('session')) return 'auth';
    if (name.includes('fetch') || name.includes('request')) return 'network';
    return 'query';
  }

  /**
   * Obtém todos os logs (útil para debug)
   */
  getLogs(category?: LogCategory, level?: LogLevel): LogEntry[] {
    let filtered = this.logs;

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered;
  }

  /**
   * Obtém métricas de performance
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Obtém estatísticas de performance por categoria
   */
  getStats(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const stats: Record<string, { count: number; totalDuration: number; maxDuration: number }> = {};

    this.metrics.forEach(metric => {
      if (!metric.duration) return;

      const category = this.getCategoryFromMetricName(metric.name);
      
      if (!stats[category]) {
        stats[category] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }

      stats[category].count++;
      stats[category].totalDuration += metric.duration;
      stats[category].maxDuration = Math.max(stats[category].maxDuration, metric.duration);
    });

    // Calcular médias
    const result: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};
    Object.entries(stats).forEach(([category, data]) => {
      result[category] = {
        count: data.count,
        avgDuration: Math.round(data.totalDuration / data.count),
        maxDuration: data.maxDuration,
      };
    });

    return result;
  }

  /**
   * Limpa todos os logs e métricas
   */
  clear(): void {
    this.logs = [];
    this.metrics.clear();
    this.log('info', 'performance', 'monitoring_cleared');
  }

  /**
   * Exporta dados para debug
   */
  export(): { logs: LogEntry[]; metrics: PerformanceMetric[]; stats: any } {
    return {
      logs: this.logs,
      metrics: this.getMetrics(),
      stats: this.getStats(),
    };
  }
}

// Singleton instance
const monitoring = new MonitoringService();

// Exportar para window para debug no console
if (typeof window !== 'undefined') {
  (window as any).__APP_METRICS__ = {
    getLogs: (category?: LogCategory, level?: LogLevel) => monitoring.getLogs(category, level),
    getMetrics: () => monitoring.getMetrics(),
    getStats: () => monitoring.getStats(),
    export: () => monitoring.export(),
    clear: () => monitoring.clear(),
  };
}

// API pública simplificada
export const logger = {
  /**
   * Log de eventos de autenticação
   */
  auth: (event: string, data?: Record<string, any>) => {
    monitoring.log('info', 'auth', event, data);
  },

  /**
   * Log de queries
   */
  query: (event: string, data?: Record<string, any>) => {
    monitoring.log('info', 'query', event, data);
  },

  /**
   * Log de erros
   */
  error: (event: string, error: Error | string, data?: Record<string, any>) => {
    monitoring.log('error', 'performance', event, {
      ...data,
      error: error instanceof Error ? error.message : error,
    });
  },

  /**
   * Log de warnings
   */
  warn: (event: string, data?: Record<string, any>) => {
    monitoring.log('warn', 'performance', event, data);
  },

  /**
   * Debug logs (apenas em dev)
   */
  debug: (event: string, data?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      monitoring.log('debug', 'performance', event, data);
    }
  },
};

export const metrics = {
  /**
   * Inicia tracking de uma métrica
   */
  start: (name: string, metadata?: Record<string, any>) => {
    monitoring.startMetric(name, metadata);
  },

  /**
   * Finaliza tracking de uma métrica
   */
  end: (name: string, metadata?: Record<string, any>) => {
    return monitoring.endMetric(name, metadata);
  },

  /**
   * Wrapper para executar função com tracking automático
   */
  track: async <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> => {
    monitoring.startMetric(name, metadata);
    try {
      const result = await fn();
      monitoring.endMetric(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      monitoring.endMetric(name, { ...metadata, success: false, error });
      throw error;
    }
  },

  /**
   * Obtém estatísticas de performance
   */
  getStats: () => monitoring.getStats(),
};

// Helper para timeout warnings
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => {
      logger.warn('timeout', { name, timeout: timeoutMs });
      reject(new Error(`${name} timeout after ${timeoutMs}ms`));
    }, timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
};

export default monitoring;
