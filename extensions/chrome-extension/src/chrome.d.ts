declare namespace chrome {
  namespace runtime {
    type MessageSender = {
      tab?: tabs.Tab;
    };

    const lastError: { message?: string } | undefined;

    const onInstalled: {
      addListener(callback: () => void): void;
    };

    const onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };
  }

  namespace tabs {
    type Tab = {
      id?: number;
      url?: string;
    };

    function query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Tab[]>;
    function sendMessage(tabId: number, message: unknown): Promise<unknown>;
  }

  namespace scripting {
    function executeScript(options: {
      target: { tabId: number };
      files: string[];
    }): Promise<unknown>;
  }
}
