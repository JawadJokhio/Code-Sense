import React, { useState } from 'react';
import { Sparkles, Copy, Check, Download, Play, Code2, Terminal, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './components/CodeEditor';

function App() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'R', 'Assembly', 'HTML/CSS'
  ];

  const [healthStatus, setHealthStatus] = useState({ groqActive: false, hfActive: false });
  const [provider, setProvider] = useState('');

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        setHealthStatus({ groqActive: data.groqActive, hfActive: data.hfActive });
      } catch (error) {
        console.error('Connection error:', error);
      }
    };
    checkHealth();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedCode('');
    setProvider('');

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });

      const data = await response.json();
      if (response.ok && data.code) {
        setGeneratedCode(data.code);
        setProvider(data.provider || 'AI');
      } else {
        const errorMsg = data.error || 'Server Internal Error';
        setGeneratedCode(`// SYSTEM ERROR\n// ${errorMsg}\n\n/* \n  ACTION REQUIRED:\n  1. Open backend/.env\n  2. Set GROQ_API_KEY or HUGGING_FACE_TOKEN\n  3. Restart backend server\n*/`);
      }
    } catch (error) {
      setGeneratedCode('// ERROR: Failed to connect to the Neural Studio backend.\n// Please ensure "node server.js" is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const element = document.createElement("a");
    const file = new Blob([generatedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `neural_code_${Date.now()}.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      'JavaScript': 'js', 'Python': 'py', 'Java': 'java', 'C++': 'cpp',
      'C#': 'cs', 'R': 'r', 'Assembly': 'asm', 'HTML/CSS': 'html'
    };
    return extensions[lang] || 'txt';
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-slate-100 selection:bg-indigo-500/40">
      <div className="bg-mesh opacity-50" />

      {/* Glossy Overlay Gradient */}
      <div className="fixed inset-0 bg-gradient-to-tr from-indigo-950/20 via-transparent to-pink-950/20 pointer-events-none" />

      <main className="relative z-10 px-4 py-16 flex flex-col items-center max-w-7xl mx-auto">

        {/* API Warning Banner */}
        {!healthStatus.groqActive && !healthStatus.hfActive && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl mb-12 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-lg bg-amber-500/20"><Terminal size={20} /></div>
              <div>
                <p className="font-bold text-sm">Action Required: No Active Providers</p>
                <p className="text-[10px] opacity-70">Add a Groq API Key or Hugging Face Token to your .env file to begin synthesis.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Brand Header */}
        <header className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-md mb-6"
          >
            <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 uppercase">Aesthetic Intelligence</span>
          </motion.div>
          <motion.h1
            className="text-7xl sm:text-9xl font-black tracking-tighter leading-none mb-4"
            style={{ textShadow: '0 0 40px rgba(99, 102, 241, 0.2)' }}
          >
            CODE<br /><span className="text-gradient">SENSE</span>
          </motion.h1>
          <p className="text-slate-500 font-medium tracking-tight">The ultimate code synthesis laboratory.</p>
        </header>

        {/* Workshop Interface */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 items-start h-full">

          {/* Input Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-container p-1 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
          >
            <div className="bg-[#0a0a0c]/90 rounded-[2.9rem] p-10 h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Sparkles size={20} className="text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Synthesis</h2>
                </div>
              </div>

              <div className="space-y-10">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase mb-4 block group-focus-within:text-indigo-400 transition-colors">Target Spec</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="premium-input appearance-none bg-[#111114] border-white/5 hover:border-white/10"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang} className="bg-[#0a0a0c]">{lang}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                      <Cpu size={16} />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase mb-4 block group-focus-within:text-indigo-400 transition-colors">Instruction Manifest</label>
                  <textarea
                    placeholder="Describe the algorithm or component..."
                    rows={8}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="premium-input min-h-[280px] bg-[#111114] border-white/5 hover:border-white/10 resize-none font-mono text-sm leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt || (!healthStatus.groqActive && !healthStatus.hfActive)}
                  className="premium-btn w-full h-20 text-xl overflow-hidden group disabled:opacity-30 disabled:grayscale transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]"
                >
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  {loading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">Synthesizing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>EXECUTE PAYLOAD</span>
                      <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Output Monolith */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-container h-full min-h-[600px] bg-[#0a0a0c]/80 border-white/5 shadow-inner"
          >
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-6">
                <div className="flex gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                </div>
                <div className="w-px h-6 bg-white/5" />
                <span className="text-[10px] font-black tracking-[0.5em] text-slate-600 uppercase">
                  {getFileExtension(language)} {provider && <span className="text-indigo-500/50">• {provider}</span>}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCopy}
                  disabled={!generatedCode}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-10"
                >
                  {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-10"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>

            <div className="relative flex-grow h-[600px] overflow-y-auto bg-[#050505]">
              <AnimatePresence mode="wait">
                {!generatedCode && !loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center p-20 text-center"
                  >
                    <div className="w-32 h-32 rounded-[3.5rem] bg-indigo-500/[0.02] flex items-center justify-center mb-10 border border-indigo-500/5 animate-float">
                      <Code2 size={64} className="text-indigo-400 opacity-20" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight mb-4 text-white/90">TRANSMISSION IDLE</h3>
                    <p className="text-slate-600 max-w-sm leading-relaxed">System awaiting prompt sequences for high-fidelity code transcription.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    className="min-h-full"
                  >
                    <CodeEditor
                      code={generatedCode}
                      language={language}
                      readOnly={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

        <footer className="mt-40 opacity-20 hover:opacity-100 transition-opacity duration-1000">
          <p className="text-[11px] font-black tracking-[1em] text-slate-400 uppercase">
            CODE SENSE •POWERED BY AI • LLAMA CORE 3.3 • 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
