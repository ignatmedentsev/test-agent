module.exports = {
  apps : [
    {
      error_file: '/dev/null',
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      kill_timeout : 3000,
      name: "ai-agent",
      out_file: '/dev/null',
      pid_file: './ai-agent.pid',
      script: 'dist/apps/ai-agent/src/main.js',
      time: false,
      watch: false,
      env: {
        NODE_OPTIONS: '--max_old_space_size=8192'
      }
    },
  ],
};
