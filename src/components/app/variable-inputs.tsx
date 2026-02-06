'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariableInputsProps {
  variables: string[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

export function VariableInputs({ variables, values, onValueChange }: VariableInputsProps) {
  if (variables.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {variables.map(variable => (
            <div key={variable} className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor={variable}>{variable}</Label>
              <Input
                id={variable}
                type="text"
                placeholder={`Enter value for [${variable}]`}
                value={values[variable] || ''}
                onChange={e => onValueChange(variable, e.target.value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
