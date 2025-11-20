// System Metrics Utility
const os = require('os');

module.exports = {
  getSystemMetrics: () => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usage: ((usedMem / totalMem) * 100).toFixed(2) + '%'
      },
      uptime: process.uptime(),
      processInfo: {
        pid: process.pid,
        version: process.version,
        platform: process.platform
      }
    };
  }
};
