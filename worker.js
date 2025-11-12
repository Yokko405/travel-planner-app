/**
 * Cloudflare Workers バックエンド
 * OpenAI APIを呼び出すプロキシサーバー
 * Basic認証対応
 */

// Basic認証の検証関数
function verifyBasicAuth(request, env) {
  // 環境変数が設定されていない場合は認証をスキップ
  if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASS) {
    return true; // 認証が設定されていない場合は許可
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    return username === env.BASIC_AUTH_USER && password === env.BASIC_AUTH_PASS;
  } catch (error) {
    return false;
  }
}

export default {
  async fetch(request, env) {
    // CORS対応
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Basic認証のチェック
    if (!verifyBasicAuth(request, env)) {
      return new Response(
        JSON.stringify({ error: '認証が必要です' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'WWW-Authenticate': 'Basic realm="AI Travel Planner"',
          },
        }
      );
    }

    // POSTリクエストのみ許可
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // リクエストボディを取得
      const body = await request.json();
      const { destination, days, theme } = body;

      // バリデーション
      if (!destination || !days || !theme) {
        return new Response(
          JSON.stringify({ error: '行き先、日数、テーマは必須です' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // APIキーの確認
      if (!env.OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'OpenAI APIキーが設定されていません' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // OpenAI APIへのリクエスト
      const prompt = `
あなたは日本語で話す旅行プランナーです。
以下の条件で、日ごとにわかりやすく旅の提案を作成してください。

- 行き先：${destination}
- 日数：${days}
- テーマ：${theme}

構成：
- 1日目（午前・午後・夜）の詳細なスケジュール
- 2日目以降も同様に日ごとに記載
- 各日の見どころ、おすすめスポット、食事の提案を含める
- 最後に「この旅の魅力まとめ」も加えてください。

日本語で、親しみやすく、具体的な提案をお願いします。
`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        let errorMessage = 'プラン生成に失敗しました。';

        if (openaiResponse.status === 401) {
          errorMessage = 'APIキーが無効です。';
        } else if (openaiResponse.status === 429) {
          errorMessage = 'APIの利用制限に達しました。しばらく待ってから再度お試しください。';
        } else if (openaiResponse.status === 500) {
          errorMessage = 'OpenAIサーバーでエラーが発生しました。しばらく待ってから再度お試しください。';
        } else {
          errorMessage = errorData.error?.message || errorMessage;
        }

        return new Response(
          JSON.stringify({ error: errorMessage }),
          {
            status: openaiResponse.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const data = await openaiResponse.json();
      const text = data.choices?.[0]?.message?.content || 'プラン生成に失敗しました。';

      return new Response(
        JSON.stringify({ result: text }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: `サーバーエラー: ${error.message}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

