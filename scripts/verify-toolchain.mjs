const expectedNode = '24.18.0';
const actualNode = process.versions.node;

if (actualNode !== expectedNode) {
  process.stderr.write(
    `PassWo requires Node.js ${expectedNode}; current runtime is ${actualNode}. Run "nvm use" before installing.\n`,
  );
  process.exit(1);
}

const userAgent = process.env.npm_config_user_agent ?? '';
if (!userAgent.startsWith('pnpm/11.15.1 ')) {
  process.stderr.write(
    'PassWo requires pnpm 11.15.1. Run "corepack prepare pnpm@11.15.1 --activate".\n',
  );
  process.exit(1);
}
