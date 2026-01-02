import React, { useState, useEffect } from "react";

const AI_MODELS = {
  groq: {
    name: "Llama",
    logo: "/logos/groq.png",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Ultra fast & high quality",
      },
    ],
  },
  gemini: {
    name: "Gemini",
    logo: "/logos/gemini.png",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Google's latest AI",
      },
    ],
  },
};

export function AIModelSelector({ onModelSelect, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("groq");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");

  useEffect(() => {
    // Notify parent of initial selection
    onModelSelect?.({
      provider: selectedProvider,
      model: selectedModel,
    });
  }, []);

  const handleModelChange = (provider, model) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    setIsOpen(false);
    onModelSelect?.({
      provider,
      model,
    });
  };

  const currentProviderData = AI_MODELS[selectedProvider];
  const currentModelData = currentProviderData.models.find(
    (m) => m.id === selectedModel
  );
  const logoSrc = currentProviderData.logo;

  if (disabled) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-black dark:bg-zinc-800 hover:bg-zinc-900 dark:hover:bg-zinc-700 transition-all text-sm border border-zinc-700 dark:border-zinc-600 ${
          isOpen ? "ring-2 ring-green-500/50" : ""
        }`}
        title="Select AI Model"
      >
        <img src={logoSrc} alt={currentProviderData.name} className="w-4 h-4" />
        <span className="hidden sm:inline text-white font-medium">
          {currentProviderData.name}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Choose AI Model
              </div>
              {Object.entries(AI_MODELS).map(([provider, data]) => {
                return (
                  <div key={provider}>
                    {data.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelChange(provider, model.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                          selectedProvider === provider &&
                          selectedModel === model.id
                            ? `${data.bgColor} border ${data.borderColor} ring-2 ring-green-500/30`
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={data.logo}
                            alt={data.name}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                {model.name}
                              </div>
                              {selectedProvider === provider &&
                                selectedModel === model.id && (
                                  <svg
                                    className="w-4 h-4 text-green-500 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {model.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                Model selection for this room
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
