import React, { useState, useCallback } from 'react';

const PasswordStrengthMeter: React.FC = () => {
  const [password, setPassword] = useState('');
  
  const checkStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strength = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Very Weak', color: 'bg-red-500' },
      2: { text: 'Weak', color: 'bg-orange-500' },
      3: { text: 'Medium', color: 'bg-yellow-500' },
      4: { text: 'Strong', color: 'bg-green-400' },
      5: { text: 'Very Strong', color: 'bg-green-600' },
      6: { text: 'Very Strong', color: 'bg-green-600' },
    }[score] || { text: 'Very Weak', color: 'bg-red-500' };

    return (
        <div className="mt-4 relative group">
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-primary border border-gray-600 text-text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                Password strength is scored on:
                <ul className="list-disc list-inside text-left">
                    <li>Length (8+ chars, 12+ chars)</li>
                    <li>Uppercase & Lowercase letters</li>
                    <li>Numbers</li>
                    <li>Special characters</li>
                </ul>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${strength.color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${(score / 6) * 100}%` }}></div>
            </div>
            <p className={`text-right mt-1 text-sm ${strength.color.replace('bg-', 'text-')}`}>{strength.text}</p>
        </div>
    );
  };
  
  return (
    <ToolCard 
        title="Password Strength Checker"
        description="Enter a password to evaluate its strength based on length, character types, and complexity."
    >
        <input 
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password"
            className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
        />
        {password && checkStrength()}
    </ToolCard>
  );
};

const Base64Tool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(btoa(input));
            } else {
                setOutput(atob(input));
            }
        } catch (error) {
            setOutput('Invalid input for decoding.');
        }
    };

    return (
        <ToolCard 
            title="Base64 Encoder/Decoder"
            description="Convert text to its Base64 representation or revert Base64 strings back to their original text."
        >
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button onClick={() => setMode('encode')} className={`px-4 py-2 text-sm rounded-md w-full transition-colors ${mode === 'encode' ? 'bg-accent-blue text-primary' : 'bg-secondary'}`}>Encode</button>
                    <button onClick={() => setMode('decode')} className={`px-4 py-2 text-sm rounded-md w-full transition-colors ${mode === 'decode' ? 'bg-accent-blue text-primary' : 'bg-secondary'}`}>Decode</button>
                </div>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Input"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
                <button onClick={handleConvert} className="w-full bg-accent-green text-primary font-bold py-2 rounded-md hover:bg-opacity-80 transition-colors">Convert</button>
                <textarea 
                    readOnly
                    value={output}
                    placeholder="Output"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2"
                />
            </div>
        </ToolCard>
    );
};

const UrlEncoderDecoder: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
        } catch (error) {
            setOutput('Invalid input for decoding.');
        }
    };

    return (
        <ToolCard 
            title="URL Encoder/Decoder"
            description="Encode text into a URL-safe format or decode it back to its original form."
        >
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button onClick={() => setMode('encode')} className={`px-4 py-2 text-sm rounded-md w-full transition-colors ${mode === 'encode' ? 'bg-accent-blue text-primary' : 'bg-secondary'}`}>Encode</button>
                    <button onClick={() => setMode('decode')} className={`px-4 py-2 text-sm rounded-md w-full transition-colors ${mode === 'decode' ? 'bg-accent-blue text-primary' : 'bg-secondary'}`}>Decode</button>
                </div>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Input"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
                <button onClick={handleConvert} className="w-full bg-accent-green text-primary font-bold py-2 rounded-md hover:bg-opacity-80 transition-colors">Convert</button>
                <textarea 
                    readOnly
                    value={output}
                    placeholder="Output"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2"
                />
            </div>
        </ToolCard>
    );
};

const HashGenerator: React.FC = () => {
    const [input, setInput] = useState('');
    const [hash, setHash] = useState('');
    const [algorithm, setAlgorithm] = useState<'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-256');
    
    const generateHash = useCallback(async () => {
        if (!input) {
            setHash('');
            return;
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHash(hashHex);
    }, [input, algorithm]);

    return (
        <ToolCard 
            title="Hash Generator"
            description="Create a cryptographic hash from text. Useful for verifying data integrity."
        >
            <div className="space-y-4">
                <select 
                    value={algorithm}
                    onChange={e => setAlgorithm(e.target.value as 'SHA-1' | 'SHA-256' | 'SHA-512')}
                    className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
                >
                    <option>SHA-1</option>
                    <option>SHA-256</option>
                    <option>SHA-512</option>
                </select>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to hash"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
                <button onClick={generateHash} className="w-full bg-accent-green text-primary font-bold py-2 rounded-md hover:bg-opacity-80 transition-colors">Generate Hash</button>
                <div className="bg-primary border border-gray-600 rounded-md p-2 min-h-[4rem] break-all font-mono text-sm">
                    {hash}
                </div>
            </div>
        </ToolCard>
    );
};

const JwtDecoder: React.FC = () => {
    const [jwt, setJwt] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState('');

    const decodeJwt = useCallback(() => {
        if (!jwt) {
            setHeader('');
            setPayload('');
            setError('');
            return;
        }
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) {
                throw new Error("Invalid JWT structure.");
            }
            const decodedHeader = JSON.stringify(JSON.parse(atob(parts[0])), null, 2);
            const decodedPayload = JSON.stringify(JSON.parse(atob(parts[1])), null, 2);
            setHeader(decodedHeader);
            setPayload(decodedPayload);
            setError('');
        } catch (e) {
            setHeader('');
            setPayload('');
            setError('Invalid JWT or Base64 encoding.');
        }
    }, [jwt]);

    return (
        <ToolCard
            title="JWT Decoder"
            description="Paste a JSON Web Token to decode its header and payload. Note: Signature is not verified."
        >
            <div className="space-y-4">
                <textarea 
                    value={jwt}
                    onChange={e => setJwt(e.target.value)}
                    placeholder="Paste JWT here"
                    className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none font-mono text-xs"
                />
                <button onClick={decodeJwt} className="w-full bg-accent-green text-primary font-bold py-2 rounded-md hover:bg-opacity-80 transition-colors">Decode</button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div>
                    <h4 className="font-bold text-accent-blue/80">Header</h4>
                    <pre className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 overflow-auto text-xs">{header}</pre>
                </div>
                <div>
                    <h4 className="font-bold text-accent-blue/80">Payload</h4>
                    <pre className="w-full h-24 bg-primary border border-gray-600 rounded-md p-2 overflow-auto text-xs">{payload}</pre>
                </div>
            </div>
        </ToolCard>
    );
};

const ToolCard: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-secondary rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-accent-blue mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-4">{description}</p>
        {children}
    </div>
);


const ToolsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-4">Cybersecurity Toolkit</h1>
      <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
        A collection of handy, client-side tools for everyday security tasks and analysis.
      </p>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <PasswordStrengthMeter />
        <Base64Tool />
        <UrlEncoderDecoder />
        <HashGenerator />
        <JwtDecoder />
      </div>
    </div>
  );
};

export default ToolsPage;