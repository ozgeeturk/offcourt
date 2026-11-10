# OffCourt

**The Story Behind the Game.** Türkçe spor markaları, sneaker kültürü ve spor tarihini anlatan editoryal dergi.

## Teknoloji ve mimari

OffCourt, Vite ile derlenen küçük bir JavaScript uygulamasıdır. İçerik veri dosyasında tutulur; statik dağıtım GitHub Pages ile uyumludur. Vite, `offcourt` depo adı için `/offcourt/` alt yoluna göre ayarlanmıştır. Hash rotaları kategori, test ve hesap görünümlerinde sunucu tarafı yönlendirme ihtiyacını önler. Makaleler ayrıca derleme sırasında ayrı HTML sayfaları olarak üretilir; her birinde kendi başlığı, açıklaması, canonical (site URL verilmişse), Article ve BreadcrumbList yapılandırılmış verisi bulunur. Böylece makalelerin tarayıcı tarafındaki etkileşimli görünümü yanında dizine alınabilir içerik de sunulur.

Kullanıcı verileri için yalnızca yayımlanabilir Supabase anon/publishable anahtarı tarayıcıya verilir. RLS, favori ve test kayıtlarını hesap bazında sınırlar. Sunucu sırrı veya service role anahtarı bu projede kullanılmaz. Supabase ayarı yokken tüm okuma ve test işlevleri yerel olarak çalışır.

## Yerel geliştirme

Node.js 20+ ve pnpm 9+ gerekir.

```sh
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm preview
```

Derleme `dist/` klasörüne GitHub Pages dosyalarını yazar. `pnpm build` tamamlandığında `dist/articles/<makale-id>/index.html`, `dist/sitemap.xml` ve `dist/robots.txt` oluşturulur. Makale ve quiz verileri `src/content.js` içindedir. Görsel kimlik ve duyarlı stiller `src/style.css` içindedir.

## Supabase ve Google OAuth

1. Supabase’te proje oluştur ve `Project URL` ile **anon/publishable** tarayıcı anahtarını al.
2. `supabase/migrations/202610270001_offcourt_user_data.sql` dosyasını SQL Editor’da çalıştır. Favori ve quiz tabloları RLS politikalarıyla yalnızca sahibine açılır.
3. Yerel deneme için `.env.example` dosyasını `.env` adıyla kopyala; `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` alanlarını doldur. Gerçek `.env` dosyası Git’e eklenmemelidir.
4. GitHub deposunda Settings → Secrets and variables → Actions → Variables alanına `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` ve gerçek yayın adresini `VITE_SITE_URL` olarak ekle. Publishable/anon anahtarı bir gizli sunucu anahtarı değildir ve RLS olmadan güvenli kabul edilmemelidir.
5. Supabase Authentication → URL Configuration içinde Site URL’yi yayın adresine, Redirect URLs listesine de `https://KULLANICI.github.io/offcourt/` adresini ekle. Özel alan adı seçersen adresleri güncelle.
6. Google Cloud Console’da OAuth 2.0 web istemcisi oluştur. Authorized redirect URI olarak Supabase’in Authentication → Providers → Google ekranında gösterdiği callback URL’yi kullan; istemci kimliğini ve istemci sırrını aynı sağlayıcı ayarına gir. Uygulamanın callback adresi Supabase tarafından yönetilir.

Google sağlayıcısı ve Supabase projesi bu çalışma alanında mevcut değildir. Bu nedenle gerçek kimlik doğrulama canlı hesapla doğrulanmadı. Giriş, kayıt, Google OAuth ve senkronizasyon env ayarlarından sonra etkinleşir. Favoriler hesap açılana kadar yerel saklanır; girişte yerel ve sunucu favorileri birleştirilir. Test sonuçları yerelde saklanır ve kullanıcı giriş yaptıysa Supabase’e kaydedilir.

## Bülten ve görseller

GitHub Pages sunucu fonksiyonu çalıştırmadığı için güvenli e-posta sağlayıcı anahtarı kullanılmaz. Form e-posta biçimini tarayıcıda doğrular ve altyapı eksikse başarı taklidi yapmadan, gönderim olmadığını bildirir. Gerçek abonelik, doğrulama ve abonelikten çıkma akışı için bir sunucu işlevi veya güvenli bülten sağlayıcısı entegrasyonu eklenmelidir.

Kapak görselleri Unsplash Images’in uzaktaki görsel uç noktasını kullanır; fotoğraflar tarihî ürün fotoğrafıymış gibi etiketlenmez. Bu seçim depo boyutunu düşük tutar ancak ağ erişimine ve Unsplash uç noktasına bağımlıdır. Üretime geçmeden önce lisans koşullarını gözden geçirip görselleri yerel, lisans bilgisi kayıtlı varlıklarla değiştirmek önerilir. Görsellerde alt metin, lazy loading ve uygun ölçü seçimi uygulanır.

## GitHub Pages yayını

1. Bu klasörü Git deposuna `offcourt` adıyla gönder ve varsayılan dalı `main` olarak kullan.
2. GitHub deposunda Settings → Pages → Build and deployment → Source altında **GitHub Actions** seç.
3. `main` dalına gönderilen her değişiklik `.github/workflows/deploy.yml` ile derlenip yayınlanır. Actions izinleri için iş akışı `pages: write` ve `id-token: write` kullanır.
4. Varsayılan depo alan adı `https://KULLANICI.github.io/offcourt/` olacaktır. Workflow, `VITE_SITE_URL` değerini GitHub kullanıcı adıyla oluşturur. Özel alan adı seçilirse workflow’daki bu değeri ve `vite.config.js` base değerini buna göre güncelle.

Örnek git gönderimi:

```sh
git init
git add .
git commit -m "Build OffCourt sports culture magazine"
git branch -M main
git remote add origin https://github.com/KULLANICI/offcourt.git
git push -u origin main
```

Yayın sonrası ana sayfayı, makale bağlantılarını doğrudan açıp yenilemeyi, `/offcourt/` alt yolunu, Actions Pages işini, `sitemap.xml`, `robots.txt`, mobil gezinmeyi, arama/filtreyi, test puanını ve favori saklamayı kontrol et. OAuth’u test etmek için Supabase redirect allowlist ve Google callback ayarlarını da doğrula.

## Kapsam ve bilinen sınırlar

- 12 Türkçe başlangıç hikâyesi, kaynak bağlantıları, arama, kategori/marka filtresi, ilgili hikâyeler, sosyal paylaşım bağlantıları ve okuma ilerleme çubuğu bulunur.
- Beş soruluk hızlı ve on soruluk kapsamlı test, açıklamalar, puan ve yerel en iyi skor/rozet özeti vardır.
- Zaman çizelgesi kaynaklıdır; günün bilgisi tarayıcının yerel tarihine göre kaynaklı kısa notlar arasından değişir. Gün hesabı UTC dönüşümüne dayanmaz.
  - Supabase hesap, Google OAuth, favori senkronizasyonu ve sonuç yazımı kodlanmıştır; gerçek proje kimlik bilgileri olmadan canlı doğrulama yapılamamıştır. Profil, yapılandırılmış Supabase hesabında son quiz sonuçlarını gösterir; cihazdaki kayıtlar da yerelde tutulur.
- SEO için makale HTML’i statik ön üretimlidir; ana sayfa ve uygulama arşiv etkileşimleri istemci tarafındadır. Site URL yapılandırılmadıysa canonical URL ve sitemap alan adları bilerek eklenmez.
- Güncel koleksiyon haberleri veya haber akışı bu ilk içerik sürümünde yer almaz; yayın sıklığı ve kaynak doğrulaması için editoryal güncelleme gerekir.
- ElevenLabs asistanı dahil edilmemiştir. Gelecekte eklenirse API anahtarı ve konuşma oturumu sunucu tarafında güvenli biçimde yönetilmelidir.
