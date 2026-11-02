/* Terminal Dojo: entirely simulated shell. No subprocess, eval, fetch or network requests. */
const TD_TASKS=[
['基本操作','現在の場所を表示しよう','pwd','現在位置を表示するコマンド','pwd'],
['基本操作','ホームにあるファイル一覧を表示しよう','ls','listの略','ls'],
['基本操作','隠しファイルも一覧表示しよう','ls -a','-a オプション','ls -a'],
['基本操作','詳細情報付きで一覧表示しよう','ls -l','-l オプション','ls -l'],
['基本操作','logs ディレクトリへ移動しよう','cd logs','change directory','cd logs'],
['基本操作','ひとつ上のディレクトリへ移動しよう','cd ..','ドット2個で親ディレクトリ','cd ..'],
['ファイル操作','readme.txt の内容を表示しよう','cat readme.txt','catで内容を表示','cat readme.txt'],
['ファイル操作','notes.txt を新規作成しよう','touch notes.txt','touchで空ファイル作成','touch notes.txt'],
['ファイル操作','practice というフォルダを作ろう','mkdir practice','mkdir は make directory','mkdir practice'],
['ファイル操作','readme.txt を backup.txt にコピーしよう','cp readme.txt backup.txt','cp 元 コピー先','cp readme.txt backup.txt'],
['ファイル操作','backup.txt を archive.txt に改名しよう','mv backup.txt archive.txt','mv 元 移動先','mv backup.txt archive.txt'],
['ファイル操作','notes.txt を削除しよう','rm notes.txt','rm はファイル削除。仮想環境のみ','rm notes.txt'],
['ログ分析','access.log の最初の3行を確認しよう','head -n 3 logs/access.log','head -n 3 ファイル','head -n 3 logs/access.log'],
['ログ分析','access.log の最後の2行を確認しよう','tail -n 2 logs/access.log','tail -n 2 ファイル','tail -n 2 logs/access.log'],
['ログ分析','ERROR の行を抽出しよう','grep ERROR logs/access.log','grep 検索語 ファイル','grep ERROR logs/access.log'],
['ログ分析','ログの行数を数えよう','wc -l logs/access.log','wc -l ファイル','wc -l logs/access.log'],
['ログ分析','ログから失敗したログインを探そう','grep FAILED logs/auth.log','FAILED の文字列を検索','grep FAILED logs/auth.log'],
['ログ分析','ログの ERROR の件数を数えよう','grep -c ERROR logs/access.log','grep -c 検索語 ファイル','grep -c ERROR logs/access.log'],
['ネットワーク','仮想ホスト training.local のDNSを調べよう','nslookup training.local','nslookup ドメイン名','nslookup training.local'],
['ネットワーク','仮想ホスト training.local へ疎通確認しよう','ping training.local','ping ホスト名。通信は発生しない','ping training.local'],
['ネットワーク','仮想ネットワークのインターフェースを表示しよう','ip addr','ip addr でIPアドレス確認','ip addr'],
['セキュリティ','report.txt のハッシュを確認しよう','sha256sum report.txt','sha256sum ファイル名','sha256sum report.txt'],
['セキュリティ','ファイルの権限を表示しよう','ls -l report.txt','ls -l ファイル名','ls -l report.txt'],
['セキュリティ','安全な読み取り権限に変更しよう','chmod 600 report.txt','chmod 600 は所有者のみ読み書き可','chmod 600 report.txt']
];
const TD_BASE={ '/home/trainee/readme.txt':'CYBER STUDY TRAINING NODE\nこの環境は完全なシミュレーターです。', '/home/trainee/report.txt':'Security audit report: TRAINING ONLY', '/home/trainee/logs/access.log':'10:01 INFO GET / 200\n10:02 ERROR GET /admin 403\n10:03 INFO GET /docs 200\n10:04 ERROR POST /login 401\n10:05 INFO GET /health 200', '/home/trainee/logs/auth.log':'10:01 SUCCESS trainee\n10:04 FAILED demo\n10:05 FAILED demo\n10:06 SUCCESS trainee' };
let tdCurrent=0,tdHistory=[],tdHistoryIndex=0,tdLines=[],tdFs={},tdCwd='/home/trainee',tdHint=0;
function tdLoad(){try{return JSON.parse(localStorage.getItem('cyber-terminal-dojo-v1')||'{}')}catch{return {}}}
function tdSave(i){let x=tdLoad();x[i]=true;try{localStorage.setItem('cyber-terminal-dojo-v1',JSON.stringify(x))}catch{}}
function tdReset(){tdFs={...TD_BASE};tdCwd='/home/trainee';tdLines=['CYBER STUDY // TERMINAL DOJO','完全ローカルの仮想端末です。実際のOS・ネットワークには接続しません。','help でコマンド一覧を確認できます。'];tdHistory=[];tdHistoryIndex=0;tdHint=0;}
function tdNorm(path){if(!path||path==='~')return '/home/trainee';const seg=(path.startsWith('/')?path:tdCwd+'/'+path).split('/'),out=[];for(const x of seg){if(!x||x==='.')continue;if(x==='..')out.pop();else out.push(x)}return '/'+out.join('/')}
function tdDir(path){return path==='/home/trainee'||path==='/home/trainee/logs'||Object.keys(tdFs).some(k=>k.startsWith(path+'/'))}
function tdList(path){let names=new Set();for(const k of Object.keys(tdFs)){if(k.startsWith(path+'/')){let name=k.slice(path.length+1).split('/')[0];if(name)names.add(name)}}if(path==='/home/trainee'){names.add('.config');names.add('logs')}return [...names].sort()}
function tdRun(raw){let tokens=raw.trim().split(/\s+/),c=tokens[0],args=tokens.slice(1),p=tdNorm(args.at(-1));
if(c==='help')return '使えるコマンド: pwd, ls, cd, cat, touch, mkdir, cp, mv, rm, head, tail, grep, wc, nslookup, ping, ip addr, sha256sum, chmod, clear, help\n実際のPCでは実行されません。';
if(c==='pwd')return tdCwd;
if(c==='ls'){let f=args.find(x=>!x.startsWith('-')),dir=tdNorm(f||'.');if(tdFs[dir]!==undefined)return '-rw-r--r-- trainee '+dir.split('/').at(-1);if(!tdDir(dir))return 'ls: ディレクトリがありません';return tdList(dir).filter(x=>args.includes('-a')||x!=='.config').map(x=>args.includes('-l')?(x.includes('.')?'-rw-r--r--':'drwxr-xr-x')+' trainee '+x:x).join('\n')||'(空のフォルダ)'}
if(c==='cd'){let target=tdNorm(args[0]||'~');if(!tdDir(target))return 'cd: ディレクトリがありません';tdCwd=target;return '(移動しました)'}
if(c==='cat')return tdFs[p]===undefined?'cat: ファイルがありません':tdFs[p];
if(c==='touch'){if(!args.length)return 'ファイル名が必要です';tdFs[p]??='';return '(ファイルを作成しました)'}
if(c==='mkdir'){if(!args.length)return 'フォルダ名が必要です';tdFs[p+'/.keep']='';return '(フォルダを作成しました)'}
if(c==='cp'||c==='mv'){if(args.length!==2)return c+': 元と先を指定してください';let a=tdNorm(args[0]),b=tdNorm(args[1]);if(tdFs[a]===undefined)return c+': 元ファイルがありません';tdFs[b]=tdFs[a];if(c==='mv')delete tdFs[a];return '(完了)'}
if(c==='rm'){if(tdFs[p]===undefined)return 'rm: ファイルがありません';delete tdFs[p];return '(仮想ファイルを削除しました)'}
if(c==='head'||c==='tail'){let n=args[0]==='-n'?Number(args[1]):10,file=tdNorm(args[0]==='-n'?args[2]:args[0]);if(tdFs[file]===undefined)return c+': ファイルがありません';let a=tdFs[file].split('\n');return (c==='head'?a.slice(0,n):a.slice(-n)).join('\n')}
if(c==='grep'){let count=args[0]==='-c',q=args[count?1:0],file=tdNorm(args[count?2:1]);if(!q||tdFs[file]===undefined)return 'grep: 検索語と存在するファイルを指定';let a=tdFs[file].split('\n').filter(x=>x.includes(q));return count?String(a.length):a.join('\n')||'(一致なし)'}
if(c==='wc'&&args[0]==='-l')return tdFs[p]===undefined?'wc: ファイルがありません':tdFs[p].split('\n').length+' '+args.at(-1);
if(c==='nslookup'&&args[0]==='training.local')return 'Server: virtual-dns\nName: training.local\nAddress: 192.0.2.10 (架空のIP)';
if(c==='ping'&&args[0]==='training.local')return 'PING training.local (192.0.2.10)\n64 bytes: time=0.4 ms (模擬応答)';
if(c==='ip'&&args[0]==='addr')return '1: lo: 127.0.0.1\n2: eth0: 192.0.2.10/24 (仮想)';
if(c==='sha256sum'&&args[0]==='report.txt')return 'a93c0f7e0b12d45a8f6c00112233445566778899aabbccddeeff001122334455  report.txt (学習用固定値)';
if(c==='chmod'&&args[0]==='600'&&args[1]==='report.txt')return '(仮想ファイルの権限を600に変更しました)';
return '未対応のコマンドです。help を入力してください。';}
function tdEsc(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function renderTerminalDojo(){let solved=tdLoad(),n=TD_TASKS.filter((_,i)=>solved[i]).length,t=TD_TASKS[tdCurrent];return pageHeader('TERMINAL // PRACTICE','ターミナル道場','自分でLinuxコマンドを入力して学習。架空のファイルとログを操作する安全な演習です。')+`<div class="panel" style="border-color:#286a48;background:#071710"><div class="flex space"><span class="kicker" style="color:#39ff91">COMMAND TRAINING // 24 MISSIONS</span><span class="pill">達成 ${n} / 24</span></div><div style="margin:15px 0"><label class="field">練習問題<select id="tdSelect" class="select">${TD_TASKS.map((v,i)=>`<option value="${i}" ${i===tdCurrent?'selected':''}>${i+1}. [${tdEsc(v[0])}] ${tdEsc(v[1])}${solved[i]?' ✓':''}</option>`).join('')}</select></label></div><h2 style="color:#b5ffd0">MISSION ${tdCurrent+1} / 24</h2><p>${tdEsc(t[1])}</p><p class="helper">初期入力は空欄。Enterキーで実行。↑↓で入力履歴を呼び出せます。</p><div class="flex"><button class="btn" id="tdHint">? ヒント</button><button class="btn" id="tdAnswer">◈ 模範コマンド</button><button class="btn" id="tdReset">↻ 仮想環境リセット</button><button class="btn" id="tdNext">次の問題 →</button></div><div id="tdHelp" class="helper" style="margin-top:12px"></div></div><section class="panel" style="margin-top:16px;background:#020b09;border-color:#286a48"><div class="kicker" style="color:#39ff91">TRAINING TERMINAL // SIMULATED SHELL</div><div id="tdOutput" role="log" aria-live="polite" style="height:310px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 monospace;color:#c2ffd7;padding:16px 0"></div><form id="tdForm" class="flex"><span id="tdPrompt" style="color:#39ff91;font:14px monospace">trainee@lab:~$</span><input id="tdInput" class="input" style="flex:1;background:#04140c;color:#e3ffeb;font-family:monospace" autocomplete="off" spellcheck="false" placeholder="ここにコマンドを入力" aria-label="Linuxコマンド入力"><button type="submit" class="btn primary">実行 ↵</button></form><p class="helper">このターミナルはJavaScript内の仮想環境です。PCのファイル変更・通信・本物のコマンド実行はしません。</p></section>`}
function bindTerminalDojo(){if(!tdLines.length)tdReset();const out=$('tdOutput'),inp=$('tdInput'),draw=()=>{out.textContent=tdLines.join('\n');out.scrollTop=out.scrollHeight;$('tdPrompt').textContent='trainee@lab:'+tdCwd.replace('/home/trainee','~')+'$'};draw();$('tdSelect').onchange=e=>{tdCurrent=Number(e.target.value);tdHint=0;navigate('terminal')};$('tdHint').onclick=()=>{tdHint=Math.min(tdHint+1,2);$('tdHelp').textContent=tdHint===1?TD_TASKS[tdCurrent][3]:'コマンドの最初の単語: '+TD_TASKS[tdCurrent][2].split(' ')[0]};$('tdAnswer').onclick=()=>{$('tdHelp').textContent='模範コマンド: '+TD_TASKS[tdCurrent][2]};$('tdReset').onclick=()=>{tdReset();draw();inp.focus()};$('tdNext').onclick=()=>{tdCurrent=(tdCurrent+1)%TD_TASKS.length;tdHint=0;navigate('terminal')};inp.onkeydown=e=>{if(e.key==='ArrowUp'&&tdHistory.length){e.preventDefault();tdHistoryIndex=Math.max(0,tdHistoryIndex-1);inp.value=tdHistory[tdHistoryIndex]}if(e.key==='ArrowDown'&&tdHistory.length){e.preventDefault();tdHistoryIndex=Math.min(tdHistory.length,tdHistoryIndex+1);inp.value=tdHistory[tdHistoryIndex]||''}};$('tdForm').onsubmit=e=>{e.preventDefault();let cmd=inp.value.trim().replace(/\s+/g,' ');inp.value='';if(!cmd)return;tdHistory.push(cmd);tdHistoryIndex=tdHistory.length;if(cmd==='clear'){tdLines=[];draw();return}let result=tdRun(cmd);tdLines.push('trainee@lab:'+tdCwd+'$ '+cmd+'\n'+result);if(cmd===TD_TASKS[tdCurrent][2]){tdSave(tdCurrent);tdLines.push('✓ MISSION CLEAR! 正しく入力できました。');if(typeof logActivity==='function')logActivity('terminal','ターミナル道場: '+TD_TASKS[tdCurrent][1]);$('tdHelp').textContent='正解！ 次の問題へ進もう。';toast('MISSION CLEAR!')}draw()};inp.focus()}
