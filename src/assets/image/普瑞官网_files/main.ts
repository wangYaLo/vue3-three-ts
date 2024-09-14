import.meta.env = {"VITE_APP_SERVER_IP":"https://127.0.0.1:8084","VITE_APP_WEBSOCKET_PATH":"wss://127.0.0.1:8084","VITE_APP_HTTP_LOG":"true","VITE_SENTRY":"false","VITE_SENTRY_DSN":"http://e856b079675867ea71c31c58507bf42f@sentry.zhhy.com/5","VITE_USER_NODE_ENV":"development","BASE_URL":"/","MODE":"development","DEV":true,"PROD":false,"SSR":false};import "/node_modules/.pnpm/element-plus@2.7.3_vue@3.4.27/node_modules/element-plus/theme-chalk/dark/css-vars.css";
import "/src/assets/font/iconfont.css";
import "/src/style/style.scss?t=1726124615864";
import "/src/assets/css/global.scss";
import "/src/assets/css/quill.snow.css";
import "/src/assets/css/quill.bubble.css";
import "/src/assets/css/quill.core.css";
import "/node_modules/.pnpm/element-plus@2.7.3_vue@3.4.27/node_modules/element-plus/dist/index.css";
import * as Sentry from "/node_modules/.vite/deps/@sentry_vue.js?v=44699a03";
import ElementPlus from "/node_modules/.vite/deps/element-plus.js?v=44699a03";
import { createApp } from "/node_modules/.vite/deps/vue.js?v=44699a03";
import wLoading from "/src/components/loading/w-loading.ts";
import { useWebsocketEvent } from "/src/components/websocket/Event.ts";
import { installApi } from "/src/api/index.ts?t=1726130347075";
import App from "/src/App.vue?t=1726130347075";
import { installI18n } from "/src/locales/index.ts";
import router from "/src/router/index.ts?t=1726130347075";
import store from "/src/store/index.ts";
console.log(ElementPlus);
const app = createApp(App);
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // 所处环境
  environment: "development",
  // 错误上报率-每次用户加载页面或在您的应用中导航时，都会发送一次请求
  tracesSampleRate: 1,
  // 指定哪些服务或 URL 域名应该接收并继续传播 Sentry 的跟踪上下文
  tracePropagationTargets: [],
  // 立即开始录制并持续整个用户会话的回放的采样率。
  replaysSessionSampleRate: 0.1,
  // 发生错误时记录的回放的采样率。这种类型的重播将在错误发生之前记录长达一分钟的事件，并继续记录直到会话结束。
  replaysOnErrorSampleRate: 1
});
app.use(ElementPlus);
app.use(store);
app.use(router);
app.use(installApi);
app.use(installI18n);
app.directive("wloading", wLoading);
app.mount("#app");
useWebsocketEvent();


;import "/@id/__x00__sentry-release-injection-file";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBQUEsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBQ1AsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBQ1AsT0FBTztBQUNQLE9BQU87QUFFUCxZQUFZLFlBQVk7QUFDeEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxpQkFBaUI7QUFFMUIsT0FBTyxjQUFjO0FBQ3JCLFNBQVMseUJBQXlCO0FBRWxDLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8sU0FBUztBQUNoQixTQUFTLG1CQUFtQjtBQUM1QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxXQUFXO0FBRWxCLFFBQVEsSUFBSSxXQUFXO0FBQ3ZCLE1BQU0sTUFBTSxVQUFVLEdBQUc7QUFDekIsT0FBTyxLQUFLO0FBQUEsRUFDUjtBQUFBLEVBQ0EsS0FBSyxZQUFZLElBQUk7QUFBQSxFQUNyQixjQUFjO0FBQUEsSUFDVixPQUFPLDBCQUEwQjtBQUFBLElBQ2pDLE9BQU8sa0JBQWtCO0FBQUEsRUFDN0I7QUFBQTtBQUFBLEVBRUEsYUFBYSxRQUFRLElBQUk7QUFBQTtBQUFBLEVBRXpCLGtCQUFrQjtBQUFBO0FBQUEsRUFFbEIseUJBQXlCLENBQUM7QUFBQTtBQUFBLEVBRTFCLDBCQUEwQjtBQUFBO0FBQUEsRUFFMUIsMEJBQTBCO0FBQzlCLENBQUM7QUFDRCxJQUFJLElBQUksV0FBVztBQUNuQixJQUFJLElBQUksS0FBSztBQUNiLElBQUksSUFBSSxNQUFNO0FBQ2QsSUFBSSxJQUFJLFVBQVU7QUFDbEIsSUFBSSxJQUFJLFdBQVc7QUFDbkIsSUFBSSxVQUFVLFlBQVksUUFBUTtBQUNsQyxJQUFJLE1BQU0sTUFBTTtBQUNoQixrQkFBa0IiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2VsZW1lbnQtcGx1cy90aGVtZS1jaGFsay9kYXJrL2Nzcy12YXJzLmNzcydcclxuaW1wb3J0ICdAL2Fzc2V0cy9mb250L2ljb25mb250LmNzcydcclxuaW1wb3J0ICdAL3N0eWxlL3N0eWxlLnNjc3MnXHJcbmltcG9ydCAnQC9hc3NldHMvY3NzL2dsb2JhbC5zY3NzJ1xyXG5pbXBvcnQgJ0AvYXNzZXRzL2Nzcy9xdWlsbC5zbm93LmNzcydcclxuaW1wb3J0ICdAL2Fzc2V0cy9jc3MvcXVpbGwuYnViYmxlLmNzcydcclxuaW1wb3J0ICdAL2Fzc2V0cy9jc3MvcXVpbGwuY29yZS5jc3MnXHJcbmltcG9ydCAnZWxlbWVudC1wbHVzL2Rpc3QvaW5kZXguY3NzJ1xyXG5cclxuaW1wb3J0ICogYXMgU2VudHJ5IGZyb20gJ0BzZW50cnkvdnVlJ1xyXG5pbXBvcnQgRWxlbWVudFBsdXMgZnJvbSAnZWxlbWVudC1wbHVzJ1xyXG5pbXBvcnQgeyBjcmVhdGVBcHAgfSBmcm9tICd2dWUnXHJcblxyXG5pbXBvcnQgd0xvYWRpbmcgZnJvbSAnQC9jb21wb25lbnRzL2xvYWRpbmcvdy1sb2FkaW5nJ1xyXG5pbXBvcnQgeyB1c2VXZWJzb2NrZXRFdmVudCB9IGZyb20gJ0AvY29tcG9uZW50cy93ZWJzb2NrZXQvRXZlbnQnXHJcblxyXG5pbXBvcnQgeyBpbnN0YWxsQXBpIH0gZnJvbSAnLi9hcGknXHJcbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAudnVlJ1xyXG5pbXBvcnQgeyBpbnN0YWxsSTE4biB9IGZyb20gJy4vbG9jYWxlcydcclxuaW1wb3J0IHJvdXRlciBmcm9tICcuL3JvdXRlcidcclxuaW1wb3J0IHN0b3JlIGZyb20gJy4vc3RvcmUnXHJcblxyXG5jb25zb2xlLmxvZyhFbGVtZW50UGx1cylcclxuY29uc3QgYXBwID0gY3JlYXRlQXBwKEFwcClcclxuU2VudHJ5LmluaXQoe1xyXG4gICAgYXBwLFxyXG4gICAgZHNuOiBpbXBvcnQubWV0YS5lbnYuVklURV9TRU5UUllfRFNOLFxyXG4gICAgaW50ZWdyYXRpb25zOiBbXHJcbiAgICAgICAgU2VudHJ5LmJyb3dzZXJUcmFjaW5nSW50ZWdyYXRpb24oKSxcclxuICAgICAgICBTZW50cnkucmVwbGF5SW50ZWdyYXRpb24oKSxcclxuICAgIF0sXHJcbiAgICAvLyDmiYDlpITnjq/looNcclxuICAgIGVudmlyb25tZW50OiBwcm9jZXNzLmVudi5OT0RFX0VOVixcclxuICAgIC8vIOmUmeivr+S4iuaKpeeOhy3mr4/mrKHnlKjmiLfliqDovb3pobXpnaLmiJblnKjmgqjnmoTlupTnlKjkuK3lr7zoiKrml7bvvIzpg73kvJrlj5HpgIHkuIDmrKHor7fmsYJcclxuICAgIHRyYWNlc1NhbXBsZVJhdGU6IDEuMCxcclxuICAgIC8vIOaMh+WumuWTquS6m+acjeWKoeaIliBVUkwg5Z+f5ZCN5bqU6K+l5o6l5pS25bm257un57ut5Lyg5pKtIFNlbnRyeSDnmoTot5/ouKrkuIrkuIvmlodcclxuICAgIHRyYWNlUHJvcGFnYXRpb25UYXJnZXRzOiBbXSxcclxuICAgIC8vIOeri+WNs+W8gOWni+W9leWItuW5tuaMgee7reaVtOS4queUqOaIt+S8muivneeahOWbnuaUvueahOmHh+agt+eOh+OAglxyXG4gICAgcmVwbGF5c1Nlc3Npb25TYW1wbGVSYXRlOiAwLjEsXHJcbiAgICAvLyDlj5HnlJ/plJnor6/ml7borrDlvZXnmoTlm57mlL7nmoTph4fmoLfnjofjgILov5nnp43nsbvlnovnmoTph43mkq3lsIblnKjplJnor6/lj5HnlJ/kuYvliY3orrDlvZXplb/ovr7kuIDliIbpkp/nmoTkuovku7bvvIzlubbnu6fnu63orrDlvZXnm7TliLDkvJror53nu5PmnZ/jgIJcclxuICAgIHJlcGxheXNPbkVycm9yU2FtcGxlUmF0ZTogMS4wLFxyXG59KVxyXG5hcHAudXNlKEVsZW1lbnRQbHVzKVxyXG5hcHAudXNlKHN0b3JlKVxyXG5hcHAudXNlKHJvdXRlcilcclxuYXBwLnVzZShpbnN0YWxsQXBpKVxyXG5hcHAudXNlKGluc3RhbGxJMThuKVxyXG5hcHAuZGlyZWN0aXZlKCd3bG9hZGluZycsIHdMb2FkaW5nKVxyXG5hcHAubW91bnQoJyNhcHAnKVxyXG51c2VXZWJzb2NrZXRFdmVudCgpIl0sImZpbGUiOiJEOi9IWV9XT1JLL3ByLXdlYi9zcmMvbWFpbi50cyJ9