'use client';

import ShortcutInput from '@/components/ShortcutInput/ShortcutInput';
import React, { useState } from 'react';

const Page = () => {
    const [data, setData] = useState('');
    return (
        <div className='flex items-center justify-center min-h-screen bg-white'>
            <ShortcutInput
                value={data}
                modifiers={['Control', 'Shift', 'Alt', 'Meta']}
                onChange={(value: string) => setData(value)}
            />
        </div>
    );
};

export default Page;