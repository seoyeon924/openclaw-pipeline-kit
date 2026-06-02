#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'openclaw.json');

const AGENTS = [
  { key: 'default', label: 'Echo (메인)' },
  { key: 'aria',    label: 'Aria' },
  { key: 'sam',     label: 'Sam' },
  { key: 'min',     label: 'Min' },
  { key: 'evan',    label: 'Evan' },
];

function askHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);

    const supportsRaw = process.stdin.isTTY && typeof process.stdin.setRawMode === 'function';

    if (supportsRaw) {
      let input = '';
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const onData = (char) => {
        if (char === '\n' || char === '\r' || char === '') {
          process.stdout.write('\n');
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          resolve(input.trim());
        } else if (char === '') {
          process.stdout.write('\n');
          process.exit();
        } else if (char === '' || char === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    } else {
      // Windows CMD 등 rawMode 미지원 환경 — 입력값 보임
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
      rl.once('line', (line) => {
        rl.close();
        resolve(line.trim());
      });
    }
  });
}

async function main() {
  console.log('\n🔐 OpenClaw 봇 토큰 등록\n');
  console.log(`설정 파일: ${CONFIG_PATH}\n`);

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ openclaw.json 파일을 찾을 수 없어요.');
    console.error('   먼저 `openclaw onboard`를 실행해서 Echo를 등록해주세요.');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ openclaw.json 파일을 읽을 수 없어요:', e.message);
    process.exit(1);
  }

  console.log('각 봇 토큰을 입력해주세요. (건너뛰려면 Enter)\n');

  const tokens = {};
  for (const agent of AGENTS) {
    const token = await askHidden(`${agent.label} 봇 토큰: `);
    if (token) {
      tokens[agent.key] = token;
      console.log(`  → 저장됨`);
    } else {
      console.log(`  → 건너뜀`);
    }
  }

  if (Object.keys(tokens).length === 0) {
    console.log('\n입력된 토큰이 없어요. 종료합니다.');
    process.exit(0);
  }

  if (!config.channels) config.channels = {};
  if (!config.channels.telegram) config.channels.telegram = { enabled: true };
  if (!config.channels.telegram.accounts) config.channels.telegram.accounts = {};

  for (const [key, token] of Object.entries(tokens)) {
    if (!config.channels.telegram.accounts[key]) {
      config.channels.telegram.accounts[key] = {};
    }
    config.channels.telegram.accounts[key].botToken = token;
    if (!config.channels.telegram.accounts[key].dmPolicy) {
      config.channels.telegram.accounts[key].dmPolicy = 'pairing';
    }
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  console.log('\n✅ 등록 완료!');
  console.log('openclaw gateway를 재시작한 후 각 봇에서 페어링 코드를 확인해주세요.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
