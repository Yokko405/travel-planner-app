// ============================================
// 設定: ここを編集してください
// ============================================

// Cloudflare Workers エンドポイントURL
const API_URL = "https://ai-travel-planner.hiyume-2.workers.dev";

// 注意: 認証情報（ID/PW）はCloudflare Workers側で管理されます
// Cloudflare Workers側で設定した認証情報を入力してください
// 設定方法: wrangler secret put BASIC_AUTH_USER と wrangler secret put BASIC_AUTH_PASS

// ============================================
// Basic認証情報の管理
// ============================================

function getAuthCredentials() {
  // localStorageから認証情報を取得
  // 初回はユーザーが入力する必要があります
  const username = localStorage.getItem('basicAuthUsername');
  const password = localStorage.getItem('basicAuthPassword');
  return { username, password };
}

function saveAuthCredentials(username, password) {
  if (username && password) {
    localStorage.setItem('basicAuthUsername', username);
    localStorage.setItem('basicAuthPassword', password);
    return true;
  }
  return false;
}

function createAuthHeader(username, password) {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}

// 認証情報の保存
function saveAuth() {
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  
  if (!username || !password) {
    alert('ユーザー名とパスワードを入力してください。');
    return;
  }
  
  if (saveAuthCredentials(username, password)) {
    alert('認証情報を保存しました。');
    document.getElementById('authUsername').value = '';
    document.getElementById('authPassword').value = '';
    toggleAuthSection();
  }
}

// 認証セクションの表示/非表示
function toggleAuthSection() {
  const section = document.getElementById('authSection');
  const btn = document.getElementById('toggleAuthBtn');
  if (section.style.display === 'none') {
    section.style.display = 'block';
    btn.textContent = '認証設定を非表示';
  } else {
    section.style.display = 'none';
    btn.textContent = '認証設定を表示';
  }
}

// ページ読み込み時に認証情報を確認
window.addEventListener('DOMContentLoaded', () => {
  const { username, password } = getAuthCredentials();
  
  if (username && password) {
    // 認証情報が保存されている場合は非表示
    document.getElementById('authSection').style.display = 'none';
  } else {
    // 認証情報がない場合は表示
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('toggleAuthBtn').textContent = '認証設定を非表示';
  }
});

async function generatePlan() {
  const destination = document.getElementById("destination").value || "京都";
  const days = document.getElementById("days").value || "2泊3日";
  const theme = document.getElementById("theme").value || "癒やしと美食";

  // バリデーション
  if (!destination || !days || !theme) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerText = "⚠️ エラー: 行き先、日数、テーマを入力してください。";
    return;
  }

  const resultDiv = document.getElementById("result");
  const button = document.querySelector("button");
  
  resultDiv.innerText = "AIが旅を考えています…🧭";
  button.disabled = true;
  button.textContent = "生成中...";

  // Basic認証情報を取得
  const { username, password } = getAuthCredentials();
  const headers = {
    "Content-Type": "application/json",
  };
  
  // 認証情報がある場合はヘッダーに追加
  if (username && password) {
    headers["Authorization"] = createAuthHeader(username, password);
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        destination,
        days,
        theme,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = "プラン生成に失敗しました。";
      
      if (response.status === 400) {
        errorMessage = `⚠️ エラー: ${errorData.error || "入力内容を確認してください。"}`;
      } else if (response.status === 401) {
        errorMessage = `⚠️ エラー: 認証に失敗しました。\n\n考えられる原因:\n- ユーザー名またはパスワードが間違っています\n- 認証情報が設定されていません\n\n解決策:\n1. 「認証設定を表示」ボタンをクリック\n2. 正しい認証情報を入力して保存してください`;
      } else if (response.status === 429) {
        errorMessage = "⚠️ エラー: APIの利用制限に達しました。しばらく待ってから再度お試しください。";
      } else if (response.status === 500) {
        errorMessage = `⚠️ エラー: ${errorData.error || "サーバーエラーが発生しました。"}`;
      } else {
        errorMessage = `⚠️ エラー: ${errorData.error || "通信エラーが発生しました。"}`;
      }
      
      resultDiv.innerText = errorMessage;
      return;
    }

    const data = await response.json();
    const text = data.result || "プラン生成に失敗しました。";
    resultDiv.innerText = text;

  } catch (error) {
    console.error(error);
    let errorMessage = "通信エラーが発生しました。";
    
    if (error.message.includes("Failed to fetch")) {
      errorMessage = `⚠️ エラー: ネットワーク接続を確認してください。\n\n考えられる原因:\n- インターネット接続が切れています\n- Cloudflare WorkersのURLが正しく設定されていません\n\n解決策:\n1. script.jsのAPI_URLを実際のCloudflare Workers URLに変更してください\n2. ネットワーク接続を確認してください`;
    } else if (error.message.includes("NetworkError")) {
      errorMessage = "⚠️ エラー: ネットワークエラーが発生しました。接続を確認してください。";
    } else {
      errorMessage = `⚠️ エラー: ${error.message}`;
    }
    
    resultDiv.innerText = errorMessage;
  } finally {
    button.disabled = false;
    button.textContent = "提案して！";
  }
}


