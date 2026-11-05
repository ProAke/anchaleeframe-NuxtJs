<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bell, Boxes,
  CalendarDays, ChartColumn, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleAlert, CircleCheck, CircleDollarSign, CircleHelp, Clock3, Copy, CreditCard, Database,
  ExternalLink, Eye, Filter, Frame, Gift, GraduationCap, Heart, Headphones, Image, Images, Info, LayoutDashboard,
  Leaf, LoaderCircle, LogOut, Mail, MapPin, Menu, MessageCircle, Minus, MoreHorizontal, Package, RefreshCw,
  PackageCheck, Pencil, Phone, Plus, Receipt, RotateCcw, Ruler, Save, Search, Settings,
  ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star, Store, Tag, Trash2,
  TrendingUp, Truck, UserRound, Users, X,
} from 'lucide-vue-next'

const props = withDefaults(defineProps<{ name: string; size?: number; strokeWidth?: number }>(), {
  size: 18,
  strokeWidth: 1.8,
})
const icons: Record<string, Component> = {
  'arrow-down-right': ArrowDownRight, 'arrow-left': ArrowLeft, 'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight, 'badge-check': BadgeCheck, bell: Bell, boxes: Boxes,
  calendar: CalendarDays, chart: ChartColumn, check: Check, 'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, alert: CircleAlert,
  'circle-check': CircleCheck, 'circle-dollar': CircleDollarSign, help: CircleHelp,
  clock: Clock3, copy: Copy, payment: CreditCard, database: Database, external: ExternalLink, eye: Eye,
  filter: Filter, frame: Frame, gift: Gift, heart: Heart, support: Headphones, headphones: Headphones,
  'graduation-cap': GraduationCap, image: Image, images: Images, info: Info, 'message-circle': MessageCircle,
  refresh: RefreshCw, dashboard: LayoutDashboard, leaf: Leaf, loader: LoaderCircle, ruler: Ruler,
  logout: LogOut, mail: Mail, pin: MapPin, 'map-pin': MapPin, menu: Menu, minus: Minus, more: MoreHorizontal,
  package: Package, 'package-check': PackageCheck, 'shopping-bag': ShoppingBag, edit: Pencil, phone: Phone, plus: Plus,
  receipt: Receipt, reset: RotateCcw, save: Save, search: Search, settings: Settings,
  shield: ShieldCheck, bag: ShoppingBag, sliders: SlidersHorizontal, sparkles: Sparkles,
  star: Star, store: Store, tag: Tag, trash: Trash2, trending: TrendingUp, truck: Truck,
  user: UserRound, users: Users, close: X,
}
</script>

<template>
  <component :is="icons[name] || CircleHelp" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
