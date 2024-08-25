import React from 'react';

import { cn } from '@/lib/utils';
import { ExternalLink } from '@/components/external-link';

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-zinc-500',
        className
      )}
      {...props}
    >
      Document Summarizer based on{' '}
      <ExternalLink href="https://github.com/vercel-labs/gemini-chatbot">
        Vercel Template
      </ExternalLink>
      .
    </p>
  );
}
