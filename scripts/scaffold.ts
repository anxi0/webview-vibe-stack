import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { scaffoldCapacitor, scaffoldFlutter } from './lib/generators';

async function main() {
  console.log(chalk.bold('\n🚀 webview-vibe-stack'));
  console.log(chalk.gray('Mobile WebView app scaffolder\n'));

  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project name:',
    validate: (v) =>
      /^[a-z0-9-]+$/.test(v) ? true : 'Lowercase letters, numbers, and hyphens only',
  });
  if (!projectName) process.exit(0);

  const projectPath = path.join(process.cwd(), 'projects', projectName);
  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `projects/${projectName} already exists. Overwrite?`,
      initial: false,
    });
    if (!overwrite) process.exit(0);
    await fs.remove(projectPath);
  }

  const { backend } = await prompts({
    type: 'select',
    name: 'backend',
    message: 'Backend:',
    choices: [
      { title: 'Supabase        (BaaS — auth, DB, realtime)', value: 'supabase' },
      { title: 'Next.js API Routes + ORM  (custom business logic)', value: 'nextjs-api' },
    ],
  });
  if (!backend) process.exit(0);

  const { shell } = await prompts({
    type: 'select',
    name: 'shell',
    message: 'App shell:',
    choices: [
      { title: 'Capacitor   (standard web features)', value: 'capacitor' },
      { title: 'Flutter     (background GPS / audio / BLE)', value: 'flutter' },
    ],
  });
  if (!shell) process.exit(0);

  console.log('\n' + chalk.bold('Summary'));
  console.log(`  Name:    ${chalk.cyan(projectName)}`);
  console.log(`  Backend: ${chalk.cyan(backend)}`);
  console.log(`  Shell:   ${chalk.cyan(shell)}`);

  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: 'Create project?',
    initial: true,
  });
  if (!confirmed) process.exit(0);

  console.log(chalk.gray('\nScaffolding...'));
  if (shell === 'capacitor') {
    await scaffoldCapacitor(projectPath, projectName, backend);
  } else {
    await scaffoldFlutter(projectPath, projectName, backend);
  }

  console.log(chalk.green('\n✓ Done!'));
  console.log(`\nProject created at ${chalk.cyan(`projects/${projectName}/`)}`);
  console.log('\nNext steps:');

  if (shell === 'capacitor') {
    console.log(chalk.gray(`  cd projects/${projectName}`));
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  npm run dev'));
  } else {
    console.log(chalk.gray(`  cd projects/${projectName}/web`));
    console.log(chalk.gray('  npm install && npm run dev'));
    console.log(chalk.gray(`\n  cd projects/${projectName}/native`));
    console.log(chalk.gray('  flutter pub get && flutter run'));
  }
}

main().catch((err) => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});
