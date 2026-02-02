'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app/sidebar';
import { AppHeader } from '@/components/app/header';
import { PromptCard } from '@/components/app/prompt-card';
import { VariableInputs } from '@/components/app/variable-inputs';
import { prompts as initialPrompts, type Prompt } from '@/lib/prompts';
import { GuruChat } from '@/components/app/guru-chat';
import { SidebarInset } from '@/components/ui/sidebar';

export default function DashboardPage() {
  const [prompts] = React.useState<Prompt[]>(initialPrompts);
  const [variables, setVariables] = React.useState<Record<string, string>>({});

  const allVariables = React.useMemo(() => {
    const varSet = new Set<string>();
    prompts.forEach(prompt => {
      const matches = prompt.template.match(/\[(.*?)\]/g);
      if (matches) {
        matches.forEach(match => {
          varSet.add(match.substring(1, match.length - 1));
        });
      }
    });
    return Array.from(varSet);
  }, [prompts]);

  React.useEffect(() => {
    const initialVars: Record<string, string> = {};
    allVariables.forEach(v => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
  }, [allVariables]);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
            <p className="text-muted-foreground">
              Discover, create, and manage your AI prompts. Use the inputs below to see them update in real-time.
            </p>
          </div>
          <VariableInputs
            variables={allVariables}
            values={variables}
            onValueChange={(key, value) => setVariables(prev => ({ ...prev, [key]: value }))}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} variables={variables} />
            ))}
          </div>
        </main>
        <GuruChat />
      </SidebarInset>
    </>
  );
}
