/* ── 回覆機制 ── */
function patMsg(cid, me, tx) {
    const c = S.contacts.find(x => x.id === cid), p = pool('pat', cid), t = tx != null ? tx : p.length ? pk(p).text : '', A = me ? S.me : c.name, B = me ? c.name : S.me;
    if (!t)
        return me ? { id: uid(), f: 'sys', pat: 1, x: A + '拍了拍' + B, t: Date.now() } : null;
    let rest = t;
    if (A && t.startsWith(A))
        rest = t.slice(A.length);
    else if (t[0] === '我')
        rest = t.slice(1);
    return { id: uid(), f: 'sys', pat: 1, x: A + rest.replace(/[我你]/g, ch => ch === '我' ? A : B), t: Date.now() };
}
function mig(o) {
    o = o || {};
    o.contacts = Array.isArray(o.contacts) ? o.contacts : [];
    o.contacts.forEach(c => { if (c.status == null)
        c.status = ''; });
    o.cats = Array.isArray(o.cats) ? o.cats : [];
    o.cards = Array.isArray(o.cards) ? o.cards : [];
    if (o.tags) {
        [['mood', '情緒'], ['heart', '心意'], ['intent', '交流意圖']].forEach(([k, n]) => { const id = uid(); o.cats.push({ id, sc: 's', kind: k, name: n, on: 1, as: [] }); (o.tags[k] || []).forEach(t => o.cards.push({ id: uid(), cat: id, text: t, on: 1 })); });
        delete o.tags;
    }
    delete o.pend;
    delete o.apend;
    if (!o.m3) {
        if (o.set) {
            if (o.set.rmax != null)
                o.set.rmax *= 60;
            if (o.set.armax != null)
                o.set.armax *= 60;
            if (o.set.lwmax != null)
                o.set.lwmax = 240;
            o.set.pat = 30;
            o.set.emoji = 30;
        }
        o.m3 = 1;
    }
    o.kon = o.kon || {};
    o.next = o.next || {};
    o.cats.forEach(c => { c.as = Array.isArray(c.as) ? c.as : []; c.on = c.on === 0 ? 0 : 1; });
    o.cards.forEach(k => { k.on = k.on === 0 ? 0 : 1; });
    o.bgs = o.bgs || {};
    o.bgColors = o.bgColors || {};
    o.bgColors.all = o.bgColors.all || '#f6f2ff';
    o.line = o.line || '#cbc7ee';
    if (o.bg && !o.bgs.home)
        o.bgs.home = o.bg;
    o.cats.forEach(c => { if (c.sc === 'e' && !c.own)
        c.own = (c.as && c.as[0]) || o.cur; });
    if (!o.m4) {
        if (o.set)
            ['lwmin', 'lwmax', 'lrmin', 'lrmax'].forEach(k => { if (o.set[k] != null)
                o.set[k] *= 60; });
        o.m4 = 1;
    }
    if (!o.m5) {
        if (o.set)
            o.set.aon = 1;
        o.m5 = 1;
    }
    if (!o.m6) {
        o.next = {};
        o.m6 = 1;
    }
    if (!o.m7) {
        let g = o.cats.find(c => c && kc(c) === 'emj');
        if (!g) {
            const id = uid();
            g = { id, sc: 's', kind: 'emj', name: 'emoji', on: 1, as: [] };
            o.cats.push(g);
            ['😊', '🥺', '💗', '✨', '🌙', '😳'].forEach(text => o.cards.push({ id: uid(), cat: id, text, on: 1 }));
        }
        o.m7 = 1;
    }
    if (!o.m8) {
        let g = o.cats.find(c => c && kc(c) === 'kao' && c.sc === 's' && c.un);
        if (!g) {
            g = { id: uid(), sc: 's', kind: 'kao', name: '未分類', on: 1, as: [], un: 1 };
            o.cats.push(g);
        }
        o.m8 = 1;
    }
    o.rounds = o.rounds || {};
    o.nst = o.nst || {};
    o.ipend = Array.isArray(o.ipend) ? o.ipend : [];
    o.plum = Array.isArray(o.plum) ? o.plum : [];
    o.book = Array.isArray(o.book) ? o.book : [];
    o.moments = Array.isArray(o.moments) ? o.moments : [];
    o.moments.forEach(p => { if (!p.id)
        p.id = uid(); });
    o.mst = o.mst && typeof o.mst === 'object' ? o.mst : {};
    o.mrep = Array.isArray(o.mrep) ? o.mrep : [];
    o.mcm = Array.isArray(o.mcm) ? o.mcm : [];
    o.theme = validTheme(o.theme);
    if (!THEME_DEFS.journal.tones.some(t => t[0] === o.jtone))
        o.jtone = 'blue';
    o.dmPrev = o.dmPrev && typeof o.dmPrev === 'object' ? o.dmPrev : null;
    o.pomo = Object.assign({ foc: 25, brk: 5, lng: 15, cyc: 4, auto: 1, snd: 1, ph: 'foc', run: 0, end: 0, left: 0, idx: 0, day: '', n: 0 }, o.pomo && typeof o.pomo === 'object' ? o.pomo : {});
    if (!o.pomo.left)
        o.pomo.left = o.pomo.foc * 60000;
    o.per = Object.assign({ cycle: 28, len: 6, days: [] }, o.per && typeof o.per === 'object' ? o.per : {});
    if (!Array.isArray(o.per.days))
        o.per.days = [];
    if (!o.per.ended || typeof o.per.ended !== 'object' || Array.isArray(o.per.ended))
        o.per.ended = {};
    if (!o.per.live || typeof o.per.live !== 'object')
        o.per.live = null;
    if (!o.m21) {
        if (!o.per.days.length && o.per.len === 5)
            o.per.len = 6;
        o.m21 = 1;
    }
    if (o.momStk == null)
        o.momStk = 1;
    o.contacts.forEach(c => cmo(c));
    if (o.set)
        ['fpost', 'flike', 'fcmt', 'dark'].forEach(k => delete o.set[k]);
    o.momCover = o.momCover || '';
    o.momSig = o.momSig || '';
    o.groups = Array.isArray(o.groups) ? o.groups : [];
    o.gdef = o.gdef || '';
    o.insp = o.insp || {};
    ['mem', 'ext', 'ev'].forEach(k => { o.insp[k] = Array.isArray(o.insp[k]) ? o.insp[k] : []; });
    o.un = o.un || {};
    o.statusClock = o.statusClock || {};
    o.dailies = o.dailies || {};
    o.dlog = o.dlog || {};
    o.dmine = o.dmine || {};
    o.todayMoodBy = o.todayMoodBy || {};
    if (!o.m8 && o.set) {
        if (o.set.armin === 600 && o.set.armax === 3600) {
            o.set.armin = 1200;
            o.set.armax = 28800;
        }
        if (o.set.fmax === 1)
            o.set.fmax = 2;
        if (o.set.afmax === 1)
            o.set.afmax = 2;
        o.m8 = 1;
    }
    if (o.set && o.set.acancel == null && o.set.aghost != null)
        o.set.acancel = o.set.aghost;
    if (!o.m16) {
        if (o.set)
            o.set.acancel = 0;
        o.m16 = 1;
    }
    if (!o.m26) {
        if (o.set && typeof o.set === 'object')
            ['On', 'Wmin', 'Wmax', 'Prob', 'Delay', 'Word', 'Phrase', 'Sent', 'Save'].forEach(k => { if (o.set['aext' + k] === undefined && o.set['ext' + k] !== undefined)
                o.set['aext' + k] = o.set['ext' + k]; });
        o.m26 = 1;
    }
    o.set = Object.assign({ ntMeOn: 0, ntMeSnd: 'tap', ntTaOn: 0, ntTaSnd: 'bubble', ntCurOn: 1, ntCurSnd: 'ding', ntOthOn: 0, ntOthSnd: 'ding', ntStarOn: 1, ntStarSnd: 'chime', star: 10, dailyMoodOn: 1, dailyOn: 1, dailyProb: 50, dailyWmin: 600, dailyWmax: 10800, moodSel: 60, lpOn: 1, lpT1: 600, lpT2: 1800, lpProb: 50, lpRmin: 3, lpRmax: 120, dailyMin: 1, dailyMax: 5, dailyKao: 10, dailyEmoji: 10, statusOn: 0, statusWindow: 7200, statusProb: 70, avatarSend: 6, dailyNotify: 1, penSnd: 1, penVol: 50, cmOn: 1, cmProb: 50, cmTmin: 3, cmTmax: 180, cmNmin: 1, cmNmax: 2, cmFmin: 1, cmFmax: 2, cmEp: 20, cmEmj: 20, cmEmjT: 10, cmKao: 20, cmKaoT: 10, crOn: 1, crSame: 1, crProb: 50, crTmin: 3, crTmax: 180, crNmin: 1, crNmax: 2, crFmin: 1, crFmax: 2, crEp: 20, crEmj: 20, crEmjT: 10, crKao: 20, crKaoT: 10, mpcmin: 3, mpcmax: 180, mpnmin: 5, mpnmax: 10, mpemj: 20, mpemjT: 15, mpkao: 20, mpkaoT: 15, mwEp: 50, mwEmin: 3, mwEmax: 50, mwNmin: 1, mwNmax: 6, mwSp: 50, mwSmin: 3, mwSmax: 50, mwKmin: 1, mwKmax: 3, mwPlace: 10, srOn: 1, srJudge: 3, srProb: 100, srMin: .5, srMax: 12, srNmin: 1, srNmax: 2, srPlace: 5, emjT: 10, kaoT: 10, aemjT: 10, akaoT: 10, lwrite: 50, lreply: 50, rmin: 3, rmax: 30, cmin: 1, cmax: 2, ghost: 10, emj: 20, kao: 20, quote: 20, fmin: 1, fmax: 1, armin: 1200, armax: 28800, acmin: 1, acmax: 2, afmin: 1, afmax: 2, acancel: 0, apat: 30, aemoji: 30, aemj: 20, akao: 20, aquote: 0, qmOn: 1, qmProb: 30, favProb: 10, mood: 15, heart: 15, intent: 15, tagMin: 1.3, tagMax: 10, imgc: 0, inspOn: 1, memOn: 1, memJmin: 5, memJmax: 10800, memProb: 10, memPmin: 3, memPmax: 60, memWord: 10, memPhrase: 10, memSent: 10, extOn: 1, extWmin: 3, extWmax: 180, extProb: 10, extDelay: 20, extWord: 10, extPhrase: 10, extSent: 10, extSave: 20, momNotify: 1, aextOn: 1, aextWmin: 3, aextWmax: 180, aextProb: 10, aextDelay: 20, aextWord: 10, aextPhrase: 10, aextSent: 10, aextSave: 20, letterNotify: 1, letterBadge: 1, lcmin: 3, lcmax: 15, lemo: 20, lemj: 20, lkao: 20, lemomax: 2, rwaterT: 3600, rmealT: 10800, rsportT: 10800, lday: 3, lwmin: 600, lwmax: LWMAX_DEF, lrmin: 10800, lrmax: 86400, rwater: 20, rmeal: 20, rsport: 20, aon: 1 }, o.set);
    if (!o.m19) {
        if (o.set) {
            if (o.set.favProb === 30)
                o.set.favProb = 10;
            ['mood', 'heart', 'intent'].forEach(k => { if (o.set[k] === 50)
                o.set[k] = 15; });
        }
        const has = k => o.cards.some(c => { const g = o.cats.find(x => x && x.id === c.cat); return g && kc(g) === k; });
        if (!has('kao')) {
            let g = o.cats.find(c => c && kc(c) === 'kao' && c.sc === 's' && c.un);
            if (!g) {
                g = { id: uid(), sc: 's', kind: 'kao', name: '未分類', on: 1, as: [], un: 1 };
                o.cats.push(g);
            }
            KAO.forEach(text => o.cards.push({ id: uid(), cat: g.id, text, on: 1 }));
        }
        if (!has('emj')) {
            let g = o.cats.find(c => c && kc(c) === 'emj' && c.sc === 's');
            if (!g) {
                g = { id: uid(), sc: 's', kind: 'emj', name: 'emoji', on: 1, as: [] };
                o.cats.push(g);
            }
            EMJ.forEach(text => o.cards.push({ id: uid(), cat: g.id, text, on: 1 }));
        }
        o.m19 = 1;
    }
    if (!o.m20) {
        if (o.set)
            ['memWord', 'memPhrase', 'extWord', 'extPhrase'].forEach(k => { if (o.set[k] === 30)
                o.set[k] = 10; });
        o.m20 = 1;
    }
    if (!o.m9) {
        if (o.set.dailyProb === 60)
            o.set.dailyProb = 70;
        if (o.set.dailyWindow === 43200)
            o.set.dailyWindow = 21600;
        if (o.set.dailyMax === 1)
            o.set.dailyMax = 5;
        o.m9 = 1;
    }
    if (!o.m10) {
        o.daily = { day: '', base: 0, next: 0, done: false, items: [] };
        o.m10 = 1;
    }
    if (!o.m11) {
        o.statusClock = o.statusClock || {};
        o.m11 = 1;
    }
    if (!o.m12) {
        if (o.set.statusProb === 30)
            o.set.statusProb = 70;
        o.m12 = 1;
    }
    if (!o.m13) {
        if (o.daily && o.daily.items && o.daily.items.length && o.cur && !o.dailies[o.cur])
            o.dailies[o.cur] = o.daily;
        if (o.todayMood && o.todayMood.id && o.cur && !o.todayMoodBy[o.cur])
            o.todayMoodBy[o.cur] = o.todayMood;
        delete o.daily;
        delete o.todayMood;
        o.m13 = 1;
    }
    if (!o.m14) {
        ['lemo', 'lemj', 'lkao'].forEach(k => { if (o.set[k] === 1)
            o.set[k] = 20; });
        o.m14 = 1;
    }
    if (!o.m15) {
        (o.letters || []).forEach(l => { if (l.from === 'ta')
            l.seen = 1; if (l.reply)
            l.rseen = 1; });
        o.m15 = 1;
    }
    if (!o.m17) {
        if (o.set && o.set.lcmax === 10)
            o.set.lcmax = 15;
        o.m17 = 1;
    }
    if (o.set && o.set.inspOn === undefined)
        o.set.inspOn = 1;
    if (!o.m23) {
        if (o.set && +o.set.memPmax === 15)
            o.set.memPmax = 60;
        o.m23 = 1;
    }
    if (!o.m22) {
        const OLD = { "mood": ["開心", "快樂", "愉悅", "高興", "滿足", "幸福", "安心", "放鬆", "輕鬆", "溫暖", "舒心", "欣慰", "愉快", "期待", "興奮", "驚喜", "雀躍", "滿足感", "充實", "踏實", "安心感", "幸運", "慶幸", "感激", "感動", "欣喜", "釋然", "喜歡", "在意", "珍惜", "信任", "依賴", "親近", "眷戀", "想念", "思念", "牽掛", "心軟", "心疼", "憐惜", "寵溺", "偏愛", "包容", "縱容", "依戀", "捨不得", "想靠近", "想陪伴", "想照顧", "想保護", "想了解", "想回應", "難過", "傷心", "失落", "遺憾", "孤單", "孤獨", "寂寞", "委屈", "無奈", "疲憊", "疲倦", "低落", "沮喪", "失望", "心酸", "苦澀", "空虛", "迷茫", "迷失", "沉重", "壓抑", "痛苦", "悲傷", "哀傷", "落寞", "生氣", "憤怒", "惱火", "煩躁", "不耐煩", "不滿", "厭煩", "抗拒", "排斥", "惱怒", "氣惱", "不甘", "嫉妒", "吃醋", "憤懣", "賭氣", "冷淡", "疏離", "害怕", "恐懼", "擔心", "憂慮", "焦慮", "緊張", "不安", "慌張", "慌亂", "害怕失去", "忐忑", "不知所措", "心慌", "壓力", "擔憂", "敏感", "害羞", "不好意思", "臉紅", "羞澀", "尷尬", "拘謹", "靦腆", "害臊", "小心翼翼", "不自然", "猶豫", "遲疑", "想說又停下", "疑惑", "困惑", "好奇", "驚訝", "意外", "震驚", "糾結", "矛盾", "懷疑", "不確定", "複雜", "說不清", "想不明白", "若有所思", "沉思", "認真", "專注", "驕傲", "自豪", "自信", "羞愧", "自責", "後悔", "內疚", "不甘心", "委屈自己", "懷疑自己", "失落感", "無力", "疲憊感", "釋懷", "接受", "放下", "平靜", "冷靜", "剋制", "忍耐", "沉默", "壓下情緒", "隱藏情緒", "假裝平靜", "表面平靜", "心裡在意", "偷偷開心", "偷偷難過", "默默期待", "默默守護", "不願表達", "不知道怎麼說", "普通", "平常", "淡然", "隨意", "自然", "放空", "發呆", "安靜", "觀察", "等待", "期待中", "沒有特別情緒", "想被理解", "想被看見", "想確認", "想解釋", "想安慰你", "想陪著你", "想靠近一點", "捨不得離開", "放心了", "安心下來", "鬆了一口氣", "忍不住開心", "忍不住在意", "藏著心事", "有話想說", "不知道怎麼表達", "心動"], "heart": ["陪伴", "陪著你", "我在這裡", "安靜陪你", "想和你一起", "不用一個人", "待在你身邊", "不會離開", "想陪你走下去", "想和你待一會", "分享", "想告訴你", "想和你聊聊", "想讓你知道", "想聽你的想法", "想看看你的反應", "想把這個分享給你", "想和你交換想法", "關心", "想照顧你", "希望你好好的", "記得休息", "不要太累", "想確認你沒事", "希望你開心", "想讓你輕鬆一點", "想念", "想到你", "想靠近一點", "想見你", "想和你在一起", "想聽你說話", "想知道你在做什麼", "捨不得離開", "回應", "我聽到了", "我明白", "我知道", "我記住了", "我理解", "收到你的話", "想回應你", "支持", "相信你", "陪你努力", "為你加油", "認可你", "為你感到驕傲", "希望你堅持", "我支持你的選擇", "邀請", "想聽你說", "想和你討論", "等你加入", "想一起分享", "想和你做同一件事", "記錄", "想記住", "保存這一刻", "珍惜現在", "留下回憶", "這個瞬間很重要", "想收藏這份感覺", "想被理解", "想被看見", "有話想說", "不知道怎麼表達", "藏著一點心事", "想確認你的心意", "捨不得表達", "想記住這個瞬間", "這個時刻很特別", "想保存這份感覺", "不想忘記", "想一直保持聯繫", "想繼續陪你交流", "想知道你的消息", "想和你一直說話", "願意告訴你", "可以放心交給你", "接受你的樣子", "你懂我的", "不用說太多", "我們之間有默契", "這個感覺只有你懂", "很喜歡你", "想被抱一下"], "intent": ["回應你", "聽到了", "收到", "我在聽", "想回答你", "認真聽你說", "想回應你", "想分享", "想告訴你", "想聊聊", "有事情想說", "想讓你知道", "想和你說說", "想聽你說", "等待你的回應", "想知道你的想法", "想聽聽你的意見", "想看看你的反應", "想靠近", "想陪著你", "想和你待一會", "想一起聊聊", "想留在這裡", "想問問你", "想了解", "有點好奇", "想知道更多", "想認識你", "想安慰你", "想陪陪你", "希望你好一點", "想讓你安心", "想照顧你", "想表達", "有話想說", "想讓你懂", "希望你理解", "想告訴你一些事", "正在想", "想一想", "不知道怎麼說", "慢慢整理", "還在思考", "想聊天", "想撒嬌", "想分享今天"], "card": ["今天有好好吃飯嗎？", "記得早點睡，別熬夜。", "我在想你。", "再多陪我一下下嘛。", "只有你能讓我這樣。"], "kao": ["(๑•́ ⃃ •̀๑)", "(*´∀`)", "(｡•́︿•̀｡)", "(≧▽≦)", "(˘▾˘)~♪"] }, ON = { "mood": ["喜悅與正向", "親近與愛意", "悲傷與低落", "憤怒與不滿", "不安與恐懼", "害羞與社交情緒", "思考與複雜情緒", "自我情緒", "剋制與隱藏", "中性與日常", "特殊表達情緒"], "heart": ["陪伴與守護", "分享與交流", "關心與照顧", "思念與靠近", "理解與回應", "鼓勵與支持", "邀請與互動", "記錄與珍惜", "特殊表達", "珍惜", "連接", "信任", "默契"], "intent": ["回應", "分享", "傾聽", "靠近", "瞭解", "安慰", "表達", "整理"] }, T = { "mood": [["喜悅與正向", ["開心", "快樂", "愉悅", "高興", "滿足", "幸福", "安心", "放鬆", "輕鬆", "溫暖", "舒心", "欣慰", "愉快", "期待", "興奮", "驚喜", "雀躍", "滿足感", "充實", "踏實", "安心感", "幸運", "慶幸", "感激", "感動", "欣喜", "釋然"]], ["親近與愛意", ["喜歡", "在意", "珍惜", "信任", "依賴", "親近", "眷戀", "想念", "思念", "牽掛", "心軟", "心疼", "憐惜", "寵溺", "偏愛", "包容", "縱容", "心動", "依戀", "捨不得", "想靠近", "想陪伴", "想照顧", "想保護", "想了解", "想回應"]], ["悲傷與低落", ["難過", "傷心", "失落", "遺憾", "孤單", "孤獨", "寂寞", "委屈", "無奈", "疲憊", "疲倦", "低落", "沮喪", "失望", "心酸", "苦澀", "空虛", "迷茫", "迷失", "沉重", "壓抑", "痛苦", "悲傷", "哀傷", "落寞"]], ["憤怒與不滿", ["生氣", "憤怒", "惱火", "煩躁", "不耐煩", "不滿", "厭煩", "抗拒", "排斥", "惱怒", "氣惱", "不甘", "嫉妒", "吃醋", "憤懣", "委屈", "賭氣", "冷淡", "疏離"]], ["不安與恐懼", ["害怕", "恐懼", "擔心", "憂慮", "焦慮", "緊張", "不安", "慌張", "慌亂", "害怕失去", "忐忑", "不知所措", "心慌", "壓力", "擔憂", "敏感"]], ["害羞與社交情緒", ["害羞", "不好意思", "臉紅", "羞澀", "尷尬", "拘謹", "靦腆", "害臊", "緊張", "小心翼翼", "不自然", "猶豫", "遲疑", "想說又停下"]], ["思考與複雜情緒", ["疑惑", "困惑", "好奇", "驚訝", "意外", "震驚", "猶豫", "糾結", "矛盾", "遲疑", "懷疑", "不確定", "複雜", "說不清", "想不明白", "若有所思", "沉思", "認真", "專注", "覺得荒謬", "心塞"]], ["自我情緒", ["驕傲", "自豪", "自信", "滿足", "羞愧", "自責", "後悔", "內疚", "不甘心", "委屈自己", "懷疑自己", "失落感", "無力", "疲憊感", "釋懷", "接受", "放下"]], ["剋制與隱藏", ["平靜", "冷靜", "剋制", "忍耐", "沉默", "壓下情緒", "隱藏情緒", "假裝平靜", "表面平靜", "心裡在意", "偷偷開心", "偷偷難過", "默默期待", "默默守護", "不願表達", "不知道怎麼說"]], ["中性與日常", ["普通", "平常", "淡然", "隨意", "自然", "放空", "發呆", "安靜", "專注", "認真", "觀察", "等待", "好奇", "期待中", "沒有特別情緒"]], ["特殊表達情緒", ["想被理解", "想被看見", "想確認", "想解釋", "想安慰你", "想陪著你", "想靠近一點", "捨不得離開", "放心了", "安心下來", "鬆了一口氣", "忍不住開心", "忍不住在意", "藏著心事", "有話想說", "不知道怎麼表達", "哭笑不得"]]], "heart": [["陪伴與守護", ["陪伴", "陪著你", "我在這裡", "安靜陪你", "想和你一起", "不用一個人", "待在你身邊", "不會離開", "想陪你走下去", "想和你待一會"]], ["分享與交流", ["分享", "想告訴你", "想和你聊聊", "想讓你知道", "想聽你的想法", "想看看你的反應", "想把這個分享給你", "想和你交換想法"]], ["關心與照顧", ["關心", "想照顧你", "希望你好好的", "記得休息", "不要太累", "想確認你沒事", "希望你開心", "想讓你輕鬆一點"]], ["思念與靠近", ["想念", "想到你", "想靠近一點", "想見你", "想和你在一起", "想聽你說話", "想知道你在做什麼", "捨不得離開"]], ["理解與回應", ["回應", "我聽到了", "我明白", "我知道", "我記住了", "我理解", "收到你的話", "想回應你"]], ["鼓勵與支持", ["支持", "相信你", "陪你努力", "為你加油", "認可你", "為你感到驕傲", "希望你堅持", "我支持你的選擇"]], ["邀請與互動", ["邀請", "想和你一起", "想聽你說", "想和你討論", "等你加入", "想一起分享", "想和你做同一件事"]], ["記錄與珍惜", ["記錄", "想記住", "保存這一刻", "珍惜現在", "留下回憶", "這個瞬間很重要", "想收藏這份感覺"]], ["特殊表達", ["想被理解", "想被看見", "有話想說", "不知道怎麼表達", "藏著一點心事", "想確認你的心意", "捨不得表達"]], ["珍惜", ["想記住這個瞬間", "這個時刻很特別", "想保存這份感覺", "不想忘記"]], ["連接", ["想一直保持聯繫", "想繼續陪你交流", "想知道你的消息", "想和你一直說話"]], ["信任", ["願意告訴你", "相信你", "可以放心交給你", "接受你的樣子"]], ["默契", ["你懂我的", "不用說太多", "我們之間有默契", "這個感覺只有你懂"]]], "intent": [["回應", ["回應你", "聽到了", "收到", "我在聽", "想回答你", "認真聽你說", "想回應你"]], ["分享", ["想分享", "想告訴你", "想聊聊", "有事情想說", "想讓你知道", "想和你說說"]], ["傾聽", ["想聽你說", "等待你的回應", "想知道你的想法", "想聽聽你的意見", "想看看你的反應"]], ["靠近", ["想靠近", "想陪著你", "想和你待一會", "想一起聊聊", "想留在這裡"]], ["瞭解", ["想問問你", "想了解", "有點好奇", "想知道更多", "想認識你"]], ["安慰", ["想安慰你", "想陪陪你", "希望你好一點", "想讓你安心", "想照顧你"]], ["表達", ["想表達", "有話想說", "想讓你懂", "希望你理解", "想告訴你一些事"]], ["整理", ["正在想", "想一想", "不知道怎麼說", "慢慢整理", "還在思考"]]] };
        o.cards = o.cards.filter(k => { const g = o.cats.find(c => c && c.id === k.cat); if (!g)
            return true; const kd = kc(g), L = OLD[kd]; if (!L || !L.includes(k.text))
            return true; return kd === 'card' ? false : g.sc !== 's'; });
        const dn = { card: ['日常關心', '撒嬌', '專屬分類'], mood: ON.mood.concat(['情緒']), heart: ON.heart.concat(['心意']), intent: ON.intent.concat(['交流意圖']) };
        o.cats = o.cats.filter(c => { if (!c || c.un)
            return true; const L = dn[kc(c)]; if (!L || !L.includes(c.name))
            return true; return o.cards.some(k => k.cat === c.id); });
        const DEFN = { emj: ['emoji'], mood: ['情緒', '情緒標籤'], heart: ['心意', '心意標籤'], intent: ['交流意圖', '交流意圖標籤'], status: ['狀態'], ask: ['他的問題'] };
        Object.keys(DEFN).forEach(kd => { if (o.cats.some(c => c && kc(c) === kd && c.un && !c.own))
            return; let g = o.cats.find(c => c && kc(c) === kd && !c.own && DEFN[kd].includes(c.name)); if (g) {
            g.name = '未分類';
            g.un = 1;
        }
        else
            o.cats.push({ id: uid(), sc: 's', kind: kd, name: '未分類', on: 1, as: [], un: 1 }); });
        Object.keys(T).forEach(kd => T[kd].forEach(([nm, items]) => { let g = o.cats.find(c => c && kc(c) === kd && c.sc === 's' && c.name === nm); if (!g) {
            g = { id: uid(), sc: 's', kind: kd, name: nm, on: 1, as: [] };
            o.cats.push(g);
        } items.forEach(text => { if (!o.cards.some(k => k.cat === g.id && k.text === text))
            o.cards.push({ id: uid(), cat: g.id, text, on: 1 }); }); }));
        o.m18 = 1;
        o.m22 = 1;
    }
    if (!o.m24) {
        const EM = [["表情", ["😂", "😊", "☺️", "😉", "😌", "🥹", "😎", "😘", "😗", "😭", "😢", "😔", "🥺", "🫤", "😕", "😠", "😤", "😒", "😑", "🙄", "🤨", "😳", "😏", "🫨", "🫩", "🙂‍↕️", "🙂‍↔️"]], ["手勢", ["👌", "🙏", "👏", "🫳", "🫸", "🫷", "🤜", "👂", "🫶"]], ["符號", ["❤️", "💕", "💗", "💍", "💢", "❌", "⭕️", "🚫", "‼️", "⁉️", "❓", "🔞"]], ["其他", ["✨", "🌊", "🌙", "💤", "💩"]]];
        const un = o.cats.find(c => c && kc(c) === 'emj' && c.un && !c.own);
        EM.forEach(([nm, items]) => { let g = o.cats.find(c => c && kc(c) === 'emj' && c.sc === 's' && !c.own && c.name === nm); if (!g) {
            g = { id: uid(), sc: 's', kind: 'emj', name: nm, on: 1, as: [] };
            o.cats.push(g);
        } items.forEach(t => { const ex = o.cards.find(k => k.text === t && kc(o.cats.find(c => c.id === k.cat) || {}) === 'emj'); if (ex) {
            if (un && ex.cat === un.id)
                ex.cat = g.id;
        }
        else
            o.cards.push({ id: uid(), cat: g.id, text: t, on: 1 }); }); });
        o.m24 = 1;
    }
    if (!o.m27) {
        const OLD = { '開心與微笑': '表情', '愛意與親近': '表情', '難過與委屈': '表情', '生氣與不滿': '表情', '害羞與驚訝': '表情', '回應與手勢': '手勢', '標記與強調': '符號', '氛圍與其他': '其他' }, BYT = { '🫶': '手勢', '❤️': '符號', '💕': '符號', '💗': '符號', '💍': '符號', '💢': '符號' }, olds = o.cats.filter(c => c && kc(c) === 'emj' && c.sc === 's' && !c.own && OLD[c.name]);
        if (olds.length) {
            const get = nm => { let g = o.cats.find(c => c && kc(c) === 'emj' && c.sc === 's' && !c.own && c.name === nm); if (!g) {
                g = { id: uid(), sc: 's', kind: 'emj', name: nm, on: 1, as: [] };
                o.cats.push(g);
            } return g; };
            ['表情', '手勢', '符號', '其他'].forEach(get);
            olds.forEach(oc => { const dst = new Set(); o.cards.forEach(k => { if (k.cat === oc.id) {
                const g = get(BYT[k.text] || OLD[oc.name]);
                k.cat = g.id;
                dst.add(g);
            } }); (oc.as || []).forEach(x => { const g = get(OLD[oc.name]); g.as = g.as || []; if (!g.as.includes(x))
                g.as.push(x); }); });
            const dead = new Set(olds.map(c => c.id));
            o.cats = o.cats.filter(c => !dead.has(c.id));
        }
        o.m27 = 1;
    }
    if (!o.m25) {
        const ss = o.set || {};
        if (ss.dailyProb === 70)
            ss.dailyProb = 50;
        if (ss.dailyOn === 0)
            ss.dailyOn = 1;
        if (ss.lrmin === 60)
            ss.lrmin = 10800;
        if (ss.lrmax === 1800)
            ss.lrmax = 86400;
        delete ss.dailyWindow;
        o.m25 = 1;
    }
    o.rems = Array.isArray(o.rems) ? o.rems : [];
    o.evlog = Array.isArray(o.evlog) ? o.evlog : [];
    o.evdel = Array.isArray(o.evdel) ? o.evdel : [];
    if (!o.m30) {
        [[1, '農曆初一'], [15, '農曆十五']].forEach(([ld, name]) => o.rems.push({ id: uid(), name, note: '', on: 1, cal: 'l', sk: '2000-01-01', lm: 1, ld, lleap: 0, rep: 'm', before: 2, rec: 0, def: 1 }));
        o.m30 = 1;
    }
    if (!o.m31) {
        if (o.set)
            o.set.lwmax = 21600;
        o.m31 = 1;
    }
    if (!o.m33) {
        const rid = new Set((o.cats || []).filter(c => c && c.kind === 'rant').map(c => c.id));
        if (rid.size) {
            o.cats = o.cats.filter(c => !rid.has(c.id));
            o.cards = (o.cards || []).filter(k => !rid.has(k.cat));
        }
        if (o.kon)
            delete o.kon.rant;
        o.m33 = 1;
    }
    if (!o.m32) {
        if (o.set)
            o.set.lwmax = LWMAX_DEF;
        (o.contacts || []).forEach(c => { if (c.ms && c.ms.tmax != null)
            c.ms.tmax = MOM_TMAX_DEF; });
        o.mst = {};
        o.m32 = 1;
    }
    if (!o.m29) {
        if (o.set) {
            o.set.dailyKao = 10;
            o.set.dailyEmoji = 10;
        }
        o.m29 = 1;
    }
    if (!o.m28) {
        (o.moments || []).forEach(p => { p.seen = 1; });
        o.m28 = 1;
    }
    o.letters = Array.isArray(o.letters) ? o.letters : [];
    o.lnext = o.lnext || {};
    o.remClock = o.remClock || {};
    if (o.set.star == null)
        o.set.star = 10;
    if (o.set.recSound == null)
        o.set.recSound = 1;
    if (o.set.recReply == null)
        o.set.recReply = 1;
    o.set.starColor = o.set.starColor || o.ink || '#5f5b8d';
    o.qa = o.qa || {};
    o.qa.single = Object.assign({ time: 20 }, o.qa.single);
    o.qa.multi = Object.assign({ time: 20, max: 2, capOn: true }, o.qa.multi);
    o.qa.survey = Object.assign({ tmin: 10, tmax: 30 }, o.qa.survey);
    o.qa.text = Object.assign({ tmin: 10, tmax: 120, cmin: 2, cmax: 5 }, o.qa.text);
    o.qa.card = Object.assign({ time: 20 }, o.qa.card);
    o.qa.cards = Array.isArray(o.qa.cards) ? o.qa.cards : [];
    o.qlog = Array.isArray(o.qlog) ? o.qlog : [];
    o.locked = o.locked !== false;
    o.contacts.forEach(c => { if (c.name === '阿澈' || c.name === '小楠')
        c.name = '名字'; });
    o.cats.forEach(c => { if (c.name === '阿澈專屬')
        c.name = '專屬分類'; });
    o.kitchen = Object.assign({ attempts: 0, products: [], unlocked: [] }, o.kitchen && typeof o.kitchen === 'object' ? o.kitchen : {});
    o.kitchen.attempts = Math.max(0, +o.kitchen.attempts || 0);
    o.kitchen.products = Array.isArray(o.kitchen.products) ? o.kitchen.products : [];
    o.kitchen.unlocked = Array.isArray(o.kitchen.unlocked) ? o.kitchen.unlocked : [];
    if (o.set && o.set.calLaterH == null) {
        o.set.calLaterH = 5;
        o.set.calLaterM = 0;
    }
    if (!o.m40 || !o.cuse || typeof o.cuse !== 'object') {
        try {
            backfillUse(o);
        }
        catch (e) {
            o.cuse = {};
        }
        o.m40 = 1;
    }
    o.cset = o.cset && typeof o.cset === 'object' ? o.cset : {};
    o.set = makeSet(o.set, o);
    return o;
}
const EMJ = ['😊', '🥺', '💗', '✨', '🌙', '😳'], KAO = [];
function syncApp() { const a = $('#app'), tb = document.querySelector('.tabs'), de = document.documentElement.style; if (!a)
    return; const r = a.getBoundingClientRect(); de.setProperty('--ax', r.left + 'px'); de.setProperty('--ay', r.top + 'px'); de.setProperty('--aw', r.width + 'px'); de.setProperty('--ah', r.height + 'px'); if (tb)
    de.setProperty('--navgap', Math.max(0, innerHeight - tb.getBoundingClientRect().top) + 'px'); }
window.addEventListener('resize', syncApp);
/* 字卡之間的標點：依「設置→聊天室回覆→標點符號」的權重隨機抽；沒有可用標點時用「。」 */
const PUNCT0 = ['——', '！', '，', '。', '⋯⋯', '？'];
function ensurePunct() { if (!Array.isArray(S.set.punct))
    S.set.punct = PUNCT0.map(t => ({ t, w: 10 })); return S.set.punct; }
function pickPunct() { const l = ensurePunct().filter(p => p && p.t && +p.w > 0), tot = l.reduce((a, p) => a + (+p.w), 0); if (!l.length || tot <= 0)
    return '。'; let r = rnd() * tot; for (const p of l) {
    r -= +p.w;
    if (r < 0)
        return p.t;
} return l[l.length - 1].t; }
function cjR(o, x, i) { if (!i)
    return x; o = o.replace(/[，,、；;]$/, ''); return o + (/[。.！？!?～~…—⋯]$/.test(o) ? '' : pickPunct()) + x; }
/* 表情包：每一輪只判定一次；成功則隨機抽一個，插在任一則回覆的前面或後面（各位置機率相同） */
/* 引用消息：每一條回覆在選擇字卡「之前」先判定一次；成功則從我發出的最後 10 條訊息中隨機選一條掛在這條回覆上 */
function qmPick(mid) { const s = S.set; if (!s.qmOn || !(rnd() * 100 < (+s.qmProb || 0)))
    return null; const mine = ms(mid).filter(m => m.f === 'me').slice(-10); if (!mine.length)
    return null; const p = mine[ri(mine.length)]; return { id: p.id, x: p.x || (p.audio ? '[語音]' : (p.img ? '' : '[表情包]')), img: p.img || '' }; }
const STEP = 500;
function gen(cid, pr, off, ctx) {
    pr = pr || '';
    const s = S.set, nc = () => { const a = Math.round(Math.min(s[pr + 'fmin'], s[pr + 'fmax'])), b = Math.round(Math.max(s[pr + 'fmin'], s[pr + 'fmax'])); return Math.max(1, a + ri(b - a + 1)); }, hit = p => rnd() * 100 < p, t = Date.now();
    const pl = cardPool(cid);
    if (!pl.length)
        return { id: uid(), f: 'sys', x: '目前沒有可抽取的字卡', t };
    /* 時間軸（毫秒）：每一個判定／選擇各占 0.5 秒，判定失敗就沒有「選擇」那一步 */
    const timed = ctx != null || typeof off === 'number';
    let w = typeof off === 'number' ? off : 0;
    const stp = () => { if (timed)
        w += STEP; };
    const EJ = pool('emj', cid), KA = pool('kao', cid);
    /* 1. 引用判定（選字卡之前） */
    if (ctx && s.qmOn && (+s.qmProb || 0) > 0)
        stp();
    const qt = ctx ? qmPick(ctx.mid || cid) : null;
    /* 2. 字卡抽取 → emoji判定 → 選擇emoji → 顏文字判定 → 選擇顏文字（每張字卡各做一次） */
    const xs = Array.from({ length: nc() }, () => { stp(); const _k = pk(pl); cuse(cid, _k); let c = _k.text; [['emj', EJ], ['kao', KA]].forEach(([k, items]) => { const p = +s[pr + k] || 0; if (p <= 0)
        return; if (timed)
        w += Math.max(0, +s[pr + k + 'T'] || 0) * 1000; stp(); if (items.length && hit(p)) {
        stp();
        const z = pk(items).text;
        c = rnd() < .5 ? z + ' ' + c : c + ' ' + z;
    } }); return c; }); /* 標點符號：排在 emoji、表情包挑選完 0.5 秒之後；字卡之間本來就有標點就跳過這一步 */
    let needP = false;
    xs.forEach((c, i) => { if (i && !/[。.！？!?～~…—⋯]$/.test(xs[i - 1].replace(/[，,、；;]$/, '')))
        needP = true; });
    if (needP)
        stp();
    const x = xs.reduce(cjR, '');
    /* 3. 情緒（一輪只會出現一次）→ 心意 → 交流意圖 */
    const tags = [];
    [['mood', '情緒'], ['heart', '心意'], ['intent', '交流意圖']].forEach(([k, n]) => { if (k === 'mood' && ctx && ctx.mood)
        return; const p = pool(k, cid); if (!p.length || S.kon[k] === 0 || !(+s[k] > 0))
        return; stp(); if (hit(s[k])) {
        stp();
        tags.push(n + '·' + pk(p).text);
        if (k === 'mood' && ctx)
            ctx.mood = 1;
    } });
    if (timed && tags.length)
        w += inspRand(s.tagMin, s.tagMax);
    /* 4. 星標判定 */
    if (+s.star > 0)
        stp();
    const m = { id: uid(), f: 'ta', x, t, tags, star: hit(s.star) };
    if (qt) {
        m.q = qt.x;
        if (qt.img)
            m.qi = qt.img;
        if (qt.id)
            m.qid = qt.id;
    }
    if (timed)
        m._rd = w;
    return m;
}
function schedule(cid, text) {
    if (isDnd(cid))
        return;
    const s = S.set, R = S.rounds[cid], now = Date.now();
    S.ghostUntil = S.ghostUntil || {};
    const lk = (S.ghostUntil[cid] || 0) > now;
    /* 已讀不回鎖定時間內：訊息一發出就立刻顯示已讀、已讀不回，不再等待 */
    if (lk) {
        delete S.rounds[cid];
        const lm0 = ms(cid)[ms(cid).length - 1];
        if (lm0 && lm0.f === 'me' && !lm0.qa && lm0.rt == null)
            lm0.rt = now;
        ms(cid).push({ id: uid(), f: 'sys', x: '已讀不回', t: now + 1 });
        save();
        if (tab === 'chat' && S.cur === cid)
            paint();
        return;
    }
    /* 聯絡人上一輪回覆還在抽取／發送（正在輸入）時：不開下一輪，也不會判定已讀不回；訊息直接算已讀 */
    if (!R && tqOn(typingQ[cid])) {
        const lm1 = ms(cid)[ms(cid).length - 1];
        if (lm1 && lm1.f === 'me' && !lm1.qa && lm1.rt == null)
            lm1.rt = now;
        return;
    }
    const rt = R ? (R.readAt != null ? R.readAt : now) : now + 1000, lm = ms(cid)[ms(cid).length - 1];
    if (lm && lm.f === 'me' && !lm.qa && lm.rt == null)
        lm.rt = rt;
    if (R) {
        const add = R.ph === 3 ? 0 : Math.min(1500, 12000 - R.ext);
        R.due += add;
        R.ext += add;
        R.qx = text || R.qx;
        if (lk && R.ph === 1)
            R.lock = 1;
        return;
    }
    S.rounds[cid] = { due: now + PRE, ext: 0, ph: 1, qx: text || '', lock: lk ? 1 : 0, readAt: now + 1000 };
}
/* 拍一拍：依機率判定一次，成功且有可抽取的拍一拍才發出 */
/* 一輪回覆：一條回覆（引用→字卡→emoji→顏文字→標籤→星標）全部完成後，等 3 秒才開始下一條；每個步驟之間隔 0.5 秒 */
function stkRoll(cid, pr) { if (!(rnd() * 100 < (+S.set[(pr || '') + 'emoji'] || 0)))
    return null; const em = pool('emoji', cid); if (!em.length)
    return null; const e = pk(em); return { id: uid(), f: 'ta', x: e.text, img: e.img, t: Date.now() }; }
/* 一輪開始時：（已讀不回之後）拍一拍判定 → 選擇拍一拍 → 表情包判定 → 選擇表情包 → 回幾條，每步 0.5 秒；回傳需要多久以及抽到的結果 */
function preRound(cid, pat, pr) {
    let ms = 0, pm = null, patAt = 0, sm = null;
    if ((+pat || 0) > 0) {
        ms += STEP;
        pm = patRoll(cid, pat);
        if (pm) {
            ms += STEP;
            patAt = ms;
        }
    }
    if ((+S.set[(pr || '') + 'emoji'] || 0) > 0 && pool('emoji', cid).length) {
        ms += STEP;
        sm = stkRoll(cid, pr);
        if (sm)
            ms += STEP;
    }
    ms += STEP;
    return { ms, pm, sm, patAt };
}
function roundQ(cid, pr, n, pm, o) {
    o = o || {};
    const ctx = { mood: 0, mid: o.mid || cid }, q = [];
    let t = o.t0 || 0, first = true;
    const put = (m, own) => { if (!first)
        t += GAP; first = false; t += own; m._rd = t; q.push(m); };
    if (pm) {
        pm._rd = o.patAt || 0;
        q.push(pm);
    }
    const sm = o.sm === undefined ? stkRoll(cid, pr) : o.sm, pos = sm ? ri(n + 1) : -1;
    for (let k = 0; k < n; k++) {
        if (pos === k)
            put(sm, 0);
        const m = gen(cid, pr, 0, ctx);
        if (m.f !== 'ta') {
            if (!o.skipSys)
                put(m, 0);
            continue;
        }
        put(m, m._rd || 0);
    }
    if (pos === n)
        put(sm, 0);
    return q;
}
function patRoll(cid, p) { if (!(rnd() * 100 < (+p || 0)))
    return null; return patMsg(cid, false) || null; }
function fire(cid, R) {
    if (!S.contacts.some(c => c.id === cid))
        return;
    const s = S.set, pm = R.pre ? R.pm : patRoll(cid, s.pat);
    sendQ(cid, roundQ(cid, '', R.n, pm, { sm: R.pre ? R.sm : undefined }), 0, 0);
}
function resetA() { if (!S)
    return; S.next = {}; S.nst = {}; save(); }
function activeSetting(k) { return ['armin', 'armax', 'ariv', 'acancel', 'acmin', 'acmax', 'afmin', 'afmax'].includes(k); }
function fireA(cid) {
    if (!S.contacts.some(c => c.id === cid))
        return;
    const s = S.set, a = Math.round(Math.min(s.acmin, s.acmax)), b = Math.round(Math.max(s.acmin, s.acmax)), n = a + ri(b - a + 1), pre = preRound(cid, s.apat, 'a');
    sendQ(cid, roundQ(cid, 'a', n, pre.pm, { skipSys: 1, sm: pre.sm, t0: pre.ms, patAt: pre.patAt }), 0, 1);
}
function typeHold(key, q, base) {
    const fi = q.findIndex(m => m.f === 'ta');
    if (fi < 0)
        return;
    let d = 0, last = 0;
    q.forEach((m, i) => { const rd = Math.max(0, (m._rd || 0) - base); d = i ? Math.max(d + GAP, rd) : rd; if (i === fi)
        q._fd = d; last = d; });
    /* 「正在輸入」撐到這一輪的字卡全部發送完才消失（不是第一條發出就消失） */
    if (last > 0) {
        const until = Date.now() + last;
        if (typingQ[key] !== 1 && !(typingQ[key] > until))
            typingQ[key] = until;
        setTimeout(() => { if (typingQ[key] && typingQ[key] !== 1 && typingQ[key] <= Date.now() + 30)
            delete typingQ[key]; if (tab === 'chat')
            paint();
        else if (tab === 'home' && grpRoom)
            paintG(); }, last + 60);
    }
}
function sendQ(cid, q, base, ext) {
    base = base || 0;
    let ef = !!ext;
    typeHold(cid, q, base);
    const send = m => { if (!S.contacts.some(c => c.id === cid))
        return; if (ef && m.f === 'ta') {
        ef = false;
        setTimeout(() => extStart(cid, 1), 0);
    } delete m._rd; m.t = Date.now(); const b = ms(cid).length; ms(cid).push(m); notify(cid, b); save(); if (tab === 'chat')
        paint();
    else if (tab === 'contacts' && !document.activeElement.isContentEditable)
        render(); badge(); };
    let d = 0;
    q.forEach((m, i) => { const rd = Math.max(0, (m._rd || 0) - base); d = i ? Math.max(d + GAP, rd) : rd; d ? setTimeout(() => send(m), d) : send(m); });
}
function notify(cid, b) { const a = ms(cid), n = a.length - b; if (n < 1)
    return; if (tab === 'chat' && S.cur === cid) {
    if (S.set.ntTaOn)
        playSnd(S.set.ntTaSnd);
    return;
} S.un[cid] = (S.un[cid] || 0) + n; const c = S.contacts.find(x => x.id === cid); let snd = null; if (cid === S.cur) {
    if (S.set.ntCurOn)
        snd = S.set.ntCurSnd || 'none';
}
else if (c && c.star && S.set.ntStarOn)
    snd = S.set.ntStarSnd || 'none';
else if (S.set.ntOthOn)
    snd = S.set.ntOthSnd || 'none'; if (snd !== null && c) {
    banner(cid === S.cur ? c.name + '：' + (a[b].x || '[表情包]') : c.name + '：發送一條消息');
    playSnd(snd);
} badge(); if (tab === 'contacts' && !document.activeElement.isContentEditable)
    render(); }
/* ── 共用通知窗：所有通知（聊天、信箱、朋友圈、每日留言…）排隊用同一個窗，一則顯示完才換下一則；開屏動畫結束前先不顯示 ── */
const BNQ = [];
let bnBusy = false;
function splashDone() { try {
    const s = document.getElementById('splash');
    if (!s || !s.isConnected)
        return true;
    if (s.style.display === 'none')
        return true;
    return getComputedStyle(s).display === 'none';
}
catch (e) {
    return true;
} }
function bnPump() {
    if (bnBusy || !BNQ.length)
        return;
    if (!splashDone()) {
        setTimeout(bnPump, 300);
        return;
    }
    const o = BNQ.shift(), e = $('#bn');
    if (!e)
        return;
    bnBusy = true;
    e.textContent = o.t;
    if (o.go) {
        e.dataset.a = 'gonotice';
        e.dataset.i = o.go;
    }
    else {
        delete e.dataset.a;
        delete e.dataset.i;
    }
    e.classList.add('show');
    /* 後面還有排隊的通知時，每則最多顯示 3.5 秒，避免一直卡在畫面上 */
    const d = BNQ.length ? Math.min(o.d, 3500) : o.d;
    clearTimeout(banner.t);
    banner.t = setTimeout(() => { e.classList.remove('show'); setTimeout(() => { bnBusy = false; bnPump(); }, 380); }, d);
}
function banner(t, d, go) { t = String(t == null ? '' : t); if (!t)
    return; if (BNQ.length && BNQ[BNQ.length - 1].t === t)
    return; BNQ.push({ t, d: d || 2000, go }); if (BNQ.length > 12)
    BNQ.shift(); bnPump(); }
function badge() { const n = tab === 'chat' ? 0 : (S.un[S.cur] || 0), e = $('#nb'); if (!e)
    return; e.textContent = n; e.style.display = n ? 'block' : 'none'; }
setInterval(() => { if (!S)
    return; const n = Date.now(), s = S.set; S.contacts.forEach(c => { ctxSet(c.id); if (!s.aon)
    return; S.nst = S.nst || {}; if (!S.next[c.id]) {
    const a = Math.max(1, +s.armin || 1) * 1000, b = Math.max(a, (+s.armax || 0) * 1000);
    S.nst[c.id] = n;
    S.next[c.id] = n + a + rnd() * (b - a);
    save();
    return;
} if (S.next[c.id] <= n) {
    const a = Math.max(1, +s.armin || 1) * 1000, b = Math.max(a, (+s.armax || 0) * 1000), rs0 = S.nst[c.id], ws = rs0 ? Math.max(n, rs0 + b) : n;
    S.nst[c.id] = ws;
    S.next[c.id] = ws + a + rnd() * (b - a);
    if (c.dnd) {
        save();
        return;
    }
    if (rnd() * 100 < Math.max(0, Math.min(100, +s.acancel || 0))) {
        save();
        return;
    }
    {
        const iv = Math.max(1, ivOf(s.ariv, +s.armin || 0)) * 1000, ws2 = rs0 ? Math.max(n, rs0 + iv) : n;
        S.nst[c.id] = ws2;
        S.next[c.id] = ws2 + a + rnd() * (b - a);
    }
    setTimeout(() => { fireA(c.id); save(); if (tab === 'chat')
        paint();
    else if (tab === 'contacts' && !document.activeElement.isContentEditable)
        render(); badge(); }, STEP);
} }); }, 1000);
function statusTick() { if (!S || !S.set || !S.set.statusOn || !S.cur)
    return; const now = Date.now(), win = Math.max(1, +S.set.statusWindow || 1) * 1000; S.statusClock = S.statusClock || {}; const rec = S.statusClock[S.cur] || (S.statusClock[S.cur] = { next: now + win }); if (now < rec.next)
    return; rec.next = now + win; if (cur().dnd) {
    save();
    return;
} const p = pool('status', S.cur); if (p.length && rnd() * 100 < Math.max(0, Math.min(100, +S.set.statusProb || 0))) {
    const c = cur();
    c.status = pk(p).text;
    if (tab === 'chat')
        render();
} save(); }
setInterval(statusTick, 60000);
setInterval(dailyTick, 60000);
setTimeout(dailyTick, 1500);
document.addEventListener('visibilitychange', () => { if (!document.hidden)
    dailyTick(); });
setInterval(() => { if (!S)
    return; const n = Date.now(); let ch = 0; Object.keys(S.rounds).forEach(cid => { const R = S.rounds[cid]; ctxSet(cid); {
    const dk = cid.indexOf('|') > 0 ? cid.split('|')[1] : cid;
    if (R.due <= n && isDnd(dk)) {
        delete S.rounds[cid];
        S.ipend = (S.ipend || []).filter(p => !(p.r && p.cid === dk));
        ch = 1;
        return;
    }
} if (cid.indexOf('|') < 0 && R.ph === 3) {
    if (!(S.ipend || []).some(p => p.r && p.cid === cid) || R.due <= n) {
        S.ipend = (S.ipend || []).filter(p => !(p.r && p.cid === cid));
        extDone(cid, n);
        ch = 1;
    }
    return;
} if (R.due > n)
    return; ch = 1; if (cid.indexOf('|') > 0) {
    gTick(cid, R, n);
    return;
} if (R.ph === 1) {
    const s = S.set, hit = p => rnd() * 100 < p;
    S.ghostUntil = S.ghostUntil || {};
    if (R.lock) {
        delete S.rounds[cid];
        ms(cid).push({ id: uid(), f: 'sys', x: '已讀不回', t: n });
    }
    else if (hit(s.ghost)) {
        S.ghostUntil[cid] = n + Math.max(0, +s.ghostLock || 0) * 1000;
        delete S.rounds[cid];
        ms(cid).push({ id: uid(), f: 'sys', x: '已讀不回', t: n });
    }
    else {
        const a = Math.round(Math.min(s.cmin, s.cmax)), b = Math.round(Math.max(s.cmin, s.cmax)), mn = Math.max(0, +s.rmin || 0) * 1000, mx = Math.max(mn, (+s.rmax || 0) * 1000);
        R.n = a + ri(b - a + 1);
        if (extStart(cid, 0, 1)) {
            R.ph = 3;
            R.due = n + (Math.max(0, +s.extWmax || 0) + Math.max(0, +s.extDelay || 0) + 60) * 1000;
        }
        else {
            const pre = preRound(cid, s.pat, '');
            R.pm = pre.pm;
            R.sm = pre.sm;
            R.pre = 1;
            R.ph = 2;
            R.due = n + pre.ms + mn + rnd() * (mx - mn);
        }
    }
}
else {
    delete S.rounds[cid];
    fire(cid, R);
} }); if (ch) {
    save();
    if (tab === 'home' && grpRoom)
        paintG();
    else if (tab === 'home' && grpOpen && !grpRoom)
        render();
    if (tab === 'chat')
        paint();
    else if (tab === 'contacts' && !document.activeElement.isContentEditable)
        render();
    badge();
} }, 1000);
