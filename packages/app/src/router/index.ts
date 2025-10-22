import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/chat/index.vue'),
        },
        {
          path: 'chat/:id',
          name: 'chat',
          components: {
            default: () => import('../views/chat/chat.vue'),
            footer: () => import('../views/chat/chat-footer.vue'),
          },
        },
        {
          path: 'md',
          name: 'md',
          component: () => import('../views/chat/md.vue'),
        },
      ],
    },
    {
      path: '/history',
      component: () => import('../views/history.vue'),
    },
  ],
})
