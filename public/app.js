import {newConversation,conversationReply} from './conversation.mjs';
import {ENTRIES,KNOWLEDGE_VERSION,entriesForMode,searchKnowledge,personalAdvice} from './knowledge.mjs';
'use strict';
const $ = id => document.getElementById(id);
let mode = 'client';
let conversationVersion=0; let aiHistory=[]; let aiBusy=false; let aiReady=false;
const faq = Object.fromEntries(ENTRIES.filter(e=>e.modes.includes('client')).map(e=>[e.id,e]));
const workflows = Object.fromEntries(ENTRIES.filter(e=>e.modes.length===1&&e.modes.includes('team')).map(e=>[e.id,e]));
let libraryLimit=6;
let conversation = newConversation();
function lang(){return $('language').value;}
function addMessage(text,role='assistant',source,label){const box=document.createElement('div');box.className='message '+role;if(role==='assistant'){const by=document.createElement('div');by.className='byline';by.textContent='VSIX ASSISTANT';box.append(by);}const body=document.createElement('div');body.textContent=text;box.append(body);if(source){const a=document.createElement('a');a.href=source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label||'Official reference ↗';box.append(a);}$('messages').append(box);$('messages').scrollTop=$('messages').scrollHeight;}
function showArticle(item){
 conversation.lastArticle=item.id;
 addMessage(item[lang()],'assistant',item.source,item.sourceLabel);
 addMessage((lang()==='hi'?'जानकारी का प्रकार: ':'Knowledge type: ')+({official:'Official-source summary',workflow:'General workflow',brand:'Owner-supplied brand information',application:'Application capability'}[item.kind])+' • Reviewed '+item.reviewed+'.');
}
function selectTopic(key){const item=ENTRIES.find(e=>e.id===key&&e.modes.includes(mode));if(!item)return;addMessage(lang()==='hi'?item.hiLabel:item.label,'user');showArticle(item);}
function render(){conversationVersion++;aiHistory=[];conversation=newConversation();const hi=lang()==='hi',team=mode==='team';document.documentElement.lang=hi?'hi':'en';$('crumb').textContent=team?'Team toolkit':'Investor desk';$('title').innerHTML=team?'Good work.<br><em>A little less busywork.</em>':'A little clarity.<br><em>A better next step.</em>';$('tag').textContent=team?'YOUR EVERYDAY WORK, SIMPLIFIED':'LET’S MAKE MONEY MATTERS SIMPLER';$('subtitle').textContent=team?'Practical checklists and prepared drafts for your working day. Public toolkit: no staff login or confidential records.':'Your space for everyday investing questions. Understand the basics, explore an illustration, or reach our team.';$('modeLabel').textContent=team?'General workflows & communication templates':'Investor education & support';$('teamTools').hidden=!team;$('question').placeholder=hi?'SIP, KYC या काम की चेकलिस्ट के बारे में पूछें…':team?'Ask about onboarding, handovers, or content…':'Say hello, ask a finance term, or discuss your portfolio…';document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});$('messages').replaceChildren();addMessage(hi?(team?'नमस्ते! मैं सामान्य कार्य चेकलिस्ट और तैयार ड्राफ्ट में मदद कर सकता हूँ। यह सार्वजनिक टूलकिट है, सुरक्षित स्टाफ पोर्टल नहीं। ग्राहक की निजी जानकारी दर्ज न करें।':'नमस्ते! मैं VSix Assistant हूँ। SIP, KYC और म्यूचुअल फंड की बुनियाद समझें या V6 टीम से जुड़ें। मैं तैयार जवाब देता हूँ; व्यक्तिगत निवेश सलाह नहीं।'):(team?'Welcome to your team toolkit. Find a checklist, prepare a reply, or draft a caption. This is a public toolkit, not a secure staff portal. Please keep client information in your approved systems.':'Hi, I’m VSix Assistant. Let’s make your next step a little clearer. Ask about investing basics or choose a topic below. Search the built-in knowledge, or use Gemini when connected.'));$('suggestions').replaceChildren();$('topics').replaceChildren();if(!team){const review=document.createElement('button');review.textContent=hi?'पोर्टफोलियो रिव्यू शुरू करें':'Start portfolio review';review.onclick=()=>ask(hi?'पोर्टफोलियो रिव्यू शुरू करें':'Start portfolio review');$('suggestions').append(review);}const data=team?workflows:faq;Object.entries(data).slice(0,5).forEach(([key,item],i)=>{const title=hi?item.hiLabel:item.label;const b=document.createElement('button');b.className='topic';b.append(document.createTextNode(title));const arrow=document.createElement('span');arrow.textContent='↗';b.append(arrow);b.onclick=()=>selectTopic(key);$('topics').append(b);if(i<3){const chip=document.createElement('button');chip.textContent=title;chip.onclick=()=>selectTopic(key);$('suggestions').append(chip);}});$('resource').querySelector('h2').innerHTML=team?'A smoother<br>working day.':'One question<br>at a time.';$('resource').querySelector('p').textContent=team?'General process guides. Verify current requirements in your authorised systems.':'Choose a topic and we’ll walk you through the essentials.';libraryLimit=6;renderLibrary();}
function preparedAsk(raw,includeUser=true){const q=raw.trim();if(!q)return;if(includeUser)addMessage(q,'user');const hi=lang()==='hi';if(/\b\d{6,}\b|\b[A-Z]{5}\d{4}[A-Z]\b/i.test(q)){addMessage(hi?'कृपया यहाँ निजी पहचान, बैंक या खाते के विवरण साझा न करें। अधिकृत सेवा माध्यम का उपयोग करें।':'Please keep identity, bank and account details out of this chat. Use your authorised service channel.');return;}const response=conversationReply(q,conversation,lang());
if(response){addMessage(response.text,'assistant',response.source,'Portfolio education reference ↗');if(response.chips)showConversationOptions(response.chips);return;}
if(/^(more|tell me more|explain more|example|give an example|और बताओ|उदाहरण)$/i.test(q)&&conversation.lastArticle){const item=ENTRIES.find(e=>e.id===conversation.lastArticle);if(item){addMessage((hi?'आपके पिछले विषय पर: ':'About the topic we just discussed: ')+(hi?item.hiLabel:item.label));showArticle(item);return;}}
if(personalAdvice(q)){showArticle(faq.risk);return;}
const results=searchKnowledge(q,mode,3);
if(results.length){const first=results[0];showArticle(first.entry);if(/\b(vs|versus|compare|difference)\b|अंतर|तुलना/i.test(q)&&results.length>1&&results[1].score>=first.score*0.65)showArticle(results[1].entry);if(results.length>1){addMessage((hi?'संबंधित विषय: ':'Related topics: ')+results.slice(1).map(x=>hi?x.entry.hiLabel:x.entry.label).join(' • '));}return;}
addMessage(hi?'यह शब्द अभी स्थानीय ज्ञान में शामिल नहीं है। इसका पूरा नाम लिखें या फाइनेंस ग्लॉसरी में खोजें। यह सीमित ज्ञान-संग्रह है; Gemini AI के लिए अलग सक्रियण ज़रूरी है।':'That term is not covered in this built-in knowledge yet. Try spelling out the full name or searching the finance glossary. This is a limited local knowledge base; Gemini AI is separate and requires activation.','assistant','https://www.franklintempletonindia.com/knowledge-centre/investment-glossary','Browse an official finance glossary ↗');}
$('chatForm').onsubmit=e=>{e.preventDefault();ask($('question').value);$('question').value='';};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});$('language').onchange=()=>{render();if($('draftOutput').value)makeDraft();};$('reset').onclick=render;
const disclaimer='MUTUAL FUND INVESTMENTS ARE SUBJECT TO MARKET RISKS, READ ALL SCHEME RELATED DOCUMENTS CAREFULLY.\nV6 ARTHGYAN LLP | AMFI-REGISTERED MUTUAL FUND DISTRIBUTOR | ARN-167996.';
const drafts={en:{caption:'What is your investment working towards?\n\nA goal gives your investment a purpose. Start by understanding how much you need, when you need it, and the risk you can afford to take. Review your plan as life changes.\n\nWhat goal are you planning for?\n\n'+disclaimer,sipreply:'Hello! Thank you for your interest in SIPs. A SIP is a method of investing regularly in a mutual fund; returns are market-linked and not guaranteed.\n\nWe can arrange a discussion about your goal, time horizon and next steps. Please let us know a convenient time. Do not send identity documents, bank details or OTPs in an open chat.\n\n'+disclaimer,followup:'Hello! We are following up on your service enquiry.\n\nVerified status: [Add the status confirmed in the authorised system]\nNext action: [Add the action and responsible person]\nNext update: [Add a realistic date/time after checking]\n\nWe will confirm once the final outcome has been verified.\n\nTeam V6 Arthgyan',handover:'TASK HANDOVER\n\nNon-sensitive reference: [Reference]\nRequest: [Action needed]\nOwner: [Responsible person]\nVerified current status: [Status]\nPending action: [Next action]\nTarget date: [Date]\nNext update due: [Date/time]\nClosure evidence: [Approved record location]\n\nKeep client identifiers and documents in approved systems.'},hi:{caption:'आपका निवेश किस लक्ष्य के लिए है?\n\nएक लक्ष्य निवेश को दिशा देता है। पहले समझें: कितनी राशि चाहिए, कब चाहिए और कितना जोखिम ले सकते हैं। ज़िंदगी बदलने पर अपने प्लान की समीक्षा करें।\n\nआप किस लक्ष्य की तैयारी कर रहे हैं?\n\n'+disclaimer,sipreply:'नमस्ते! SIP में रुचि दिखाने के लिए धन्यवाद। SIP म्यूचुअल फंड में नियमित निवेश का तरीका है। रिटर्न बाज़ार से जुड़े हैं और गारंटीड नहीं हैं।\n\nआपके लक्ष्य, समय और अगले कदमों पर चर्चा के लिए सुविधाजनक समय बताएँ। खुले चैट में पहचान दस्तावेज़, बैंक विवरण या OTP न भेजें।\n\n'+disclaimer,followup:'नमस्ते! आपके सेवा अनुरोध के संबंध में अपडेट।\n\nसत्यापित स्थिति: [अधिकृत सिस्टम से जाँची गई स्थिति]\nअगली कार्रवाई: [कार्रवाई और ज़िम्मेदार व्यक्ति]\nअगला अपडेट: [जाँच के बाद तय दिन/समय]\n\nअंतिम परिणाम सत्यापित होने पर पुष्टि करेंगे।\n\nटीम V6 Arthgyan',handover:'कार्य हैंडओवर\n\nगैर-संवेदनशील संदर्भ: [संदर्भ]\nअनुरोध: [ज़रूरी कार्रवाई]\nज़िम्मेदार व्यक्ति: [नाम]\nसत्यापित स्थिति: [स्थिति]\nलंबित कार्रवाई: [अगला कदम]\nलक्ष्य तिथि: [दिनांक]\nअगला अपडेट: [दिन/समय]\nसमापन प्रमाण: [स्वीकृत रिकॉर्ड स्थान]\n\nग्राहक के पहचान विवरण और दस्तावेज़ स्वीकृत सिस्टम में रखें।'}};
function makeDraft(){$('draftOutput').value=drafts[lang()][$('template').value];$('copyStatus').textContent='Draft ready. Edit placeholders and review before use.';}$('draft').onclick=makeDraft;$('copyDraft').onclick=async()=>{if(!$('draftOutput').value){$('copyStatus').textContent='Create a draft first.';return;}try{await navigator.clipboard.writeText($('draftOutput').value);$('copyStatus').textContent='Copied. Review before sending.';}catch{$('draftOutput').focus();$('draftOutput').select();$('copyStatus').textContent='Press Ctrl+C or copy the selected draft.';}};
function sipValue(monthly,years,annual){const months=years*12;const r=Math.pow(1+annual/100,1/12)-1;return Math.abs(r)<1e-12?monthly*months:monthly*Math.expm1(months*Math.log1p(r))/r;}
function calculate(){const monthly=Number($('monthly').value),years=Number($('years').value),rate=Number($('rate').value);if(!$('calcForm').reportValidity())return;const value=sipValue(monthly,years,rate);const format=v=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);$('calcResult').replaceChildren();const label=document.createElement('div');label.textContent='Illustrated future value';const total=document.createElement('strong');total.textContent=format(value);const invested=document.createElement('span');invested.textContent='Total contributions: '+format(monthly*years*12);const change=document.createElement('span');change.textContent='Illustrated gain / loss: '+format(value-monthly*years*12);$('calcResult').append(label,total,invested,change);}
$('openCalc').onclick=()=>{$('calculator').showModal();calculate();};$('closeCalc').onclick=()=>$('calculator').close();$('calcForm').onsubmit=e=>{e.preventDefault();calculate();};render();

async function loadAIStatus(){
 try { const response=await fetch('/api/ai-status',{cache:'no-store',signal:AbortSignal.timeout(5000)}); const data=response.ok?await response.json():{}; aiReady=data.ready===true; }
 catch {aiReady=false;}
 const option=$('answerMode').querySelector('[value="ai"]');option.disabled=!aiReady;option.textContent=aiReady?'Gemini AI':'Gemini AI — awaiting setup';
 $('aiStatus').textContent=aiReady?'Gemini configured • up to 50 attempts/day across this site':'AI not connected • prepared answers available';
 if(!aiReady){$('answerMode').value='prepared';$('aiDisclosure').hidden=true;}
}
$('answerMode').onchange=()=>{conversationVersion++;aiHistory=[];$('aiDisclosure').hidden=$('answerMode').value!=='ai';if($('answerMode').value==='ai')addMessage(lang()==='hi'?'Gemini AI चुना गया है। सामान्य सवाल पूछें; हर जवाब उपयोग से पहले जाँचें।':'Gemini AI selected. Ask general questions; review each answer before use.');};
async function ask(raw){
 const question=raw.trim();if(!question||aiBusy)return;
 if($('answerMode').value!=='ai'||!aiReady){preparedAsk(question);return;}
 if(/\b[A-Z]{5}\d{4}[A-Z]\b|\b(?:\d[ -]?){10,16}\b|AIza[\w-]{20,}|\b(?:OTP|password|api[ _-]?key)\s*[:=]\s*\S+/i.test(question)) {addMessage(lang()==='hi'?'निजी पहचान, बैंक विवरण, पासवर्ड और API key यहाँ साझा न करें।':'Please keep identity numbers, bank details, passwords and API keys out of this chat.');return;}
 const ticket=conversationVersion;const language=lang();addMessage(question,'user');aiBusy=true;$('chatForm').querySelector('button').disabled=true;$('aiStatus').textContent='Gemini is preparing a response…';
 try {
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,language,mode,history:aiHistory}),signal:AbortSignal.timeout(22000)});
  const data=await response.json();if(ticket!==conversationVersion)return;
  if(!response.ok||typeof data.text!=='string'){
   const reasons={not_configured:'Gemini is not configured.',daily_limit:'The site’s daily AI limit has been reached.',minute_limit:'The site’s minute limit has been reached. Try again later.',provider_limit:'Google’s allowance is currently unavailable.',sign_in_required:'Sign in to use Gemini AI.',sensitive_information:'Please remove sensitive details before asking.'};
   const reason=reasons[data.error]||'Gemini could not answer right now.';
   addMessage(language==='hi'?'AI अभी जवाब नहीं दे पाया। नीचे तैयार जवाब उपलब्ध है।':reason+' Using a prepared response below.');
   if(data.error!=='sensitive_information')preparedAsk(question,false);return;
  }
  addMessage((language==='hi'?'Gemini AI का ड्राफ्ट • उपयोग से पहले जाँचें\n\n':'Gemini AI draft • review before use\n\n')+data.text+(data.truncated?'\n\n[Response reached the length limit.]':''));
  if(Array.isArray(data.references))for(const ref of data.references){if(typeof ref.url==='string'&&ref.url.startsWith('https://'))addMessage('Knowledge reference • '+ref.title+' • Reviewed '+ref.reviewed,'assistant',ref.url,'Open source reference ↗');}
  aiHistory=[...aiHistory,{role:'user',text:question},{role:'model',text:data.text.slice(0,2000)}].slice(-6);
 }catch{if(ticket===conversationVersion){addMessage(language==='hi'?'AI से कनेक्ट नहीं हो पाया। नीचे तैयार जवाब उपलब्ध है।':'AI connection unavailable. Using a prepared response below.');preparedAsk(question,false);}}
 finally {aiBusy=false;$('chatForm').querySelector('button').disabled=false;$('aiStatus').textContent=aiReady?'Gemini configured • up to 50 attempts/day across this site':'AI not connected • prepared answers available';}
}
loadAIStatus();

function renderLibrary(){
 const query=$('knowledgeSearch').value;const category=$('knowledgeCategory').value;
 let found=query.trim()?searchKnowledge(query,mode,8).map(x=>x.entry):entriesForMode(mode);
 if(category!=='all')found=found.filter(e=>e.category===category);
 $('knowledgeResults').replaceChildren();
 $('knowledgeCount').textContent=found.length+' matching topics • '+entriesForMode(mode).length+' available in this workspace';
 for(const item of found.slice(0,libraryLimit)){
  const card=document.createElement('article');card.className='knowledge-card';
  const kind=document.createElement('small');kind.textContent=item.category+' • '+item.kind;
  const heading=document.createElement('h3');heading.textContent=lang()==='hi'?item.hiLabel:item.label;
  const text=document.createElement('p');text.textContent=item[lang()].slice(0,135)+'…';
  const button=document.createElement('button');button.type='button';button.textContent=lang()==='hi'?'जवाब पढ़ें →':'Read answer →';button.onclick=()=>{selectTopic(item.id);$('messages').scrollIntoView({behavior:'smooth',block:'center'});};
  const meta=document.createElement('small');meta.textContent='Reviewed '+item.reviewed;
  card.append(kind,heading,text,button,meta);$('knowledgeResults').append(card);
 }
 if(!found.length){const text=document.createElement('p');text.textContent='No supported topic found. Try a simpler term or another category.';$('knowledgeResults').append(text);}
 $('knowledgeMore').hidden=found.length<=libraryLimit;
}
$('knowledgeSearch').oninput=()=>{libraryLimit=6;renderLibrary();};
$('knowledgeCategory').onchange=()=>{libraryLimit=6;renderLibrary();};
$('knowledgeMore').onclick=()=>{libraryLimit+=6;renderLibrary();};
$('knowledgeVersion').textContent=ENTRIES.length+' curated topics • reviewed '+KNOWLEDGE_VERSION;

function showConversationOptions(options){
 $('suggestions').replaceChildren();
 for(const text of options){const button=document.createElement('button');button.type='button';button.textContent=text;button.onclick=()=>ask(text);$('suggestions').append(button);}
}
