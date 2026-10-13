# ServerSage

[![CI](https://github.com/euglado/serversage/actions/workflows/ci.yml/badge.svg)](https://github.com/euglado/serversage/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ServerSage, sunucu yöneticilerinin ayar dosyalarıyla uğraşmadan düzenli bir başlangıç yapmasına yardım eder. Topluluk, oyun veya eğitim şablonunu seçin; açılacak kanalların listesini inceleyin ve hazırsanız onaylayın. Bot yalnızca eksik kategori ve kanalları oluşturur; sunucuda var olan hiçbir şeyi silmez veya değiştirmez.

Discord uygulamanız Türkçe ise kurulum ekranları Türkçe, İngilizce ise İngilizce görünür. Diğer dillerde sunucu dili Türkçeyse Türkçe, değilse İngilizce kullanılır. Komut Türkçe Discord’da /sunucu-kurulum, diğer dillerde /server-setup olarak gösterilir.

[English guide](README.md) · [Güvenlik politikası](SECURITY.md) · [Katkı rehberi](CONTRIBUTING.md)

## Neler yapar?

- Tıklayarak ilerlenen özel bir kurulum sihirbazı açar. Düğmeleri yalnızca sihirbazı başlatan kişi kullanabilir.
- Değişiklik yapmadan önce kanal listesini gösterir. Düzeni oluştur düğmesi ayrı bir onay adımıdır.
- Topluluk, Oyun ve Eğitim şablonları sunar. Her şablonda üç kategori ve yedi kanal bulunur.
- Aynı adlı kategoriyi bulursa kullanır; o kategorideki aynı tür ve ada sahip kanalı yeniden oluşturmaz.
- Oluşturulanları, olduğu gibi bırakılanları ve Discord’un oluşturamadıklarını ayrı ayrı listeler.
- Yarım kalan kurulum güvenle yeniden çalıştırılabilir. Tamamlanmış öğeler yeniden denemede atlanır.
- Aynı çalışan bot sürecinde aynı sunucu için gelen kurulumları sıraya koyar.
- Yalnızca Discord’un Guilds Gateway intent’ini kullanır. Normal mesajları okumaz ve ayrıcalıklı intent istemez.

## Şablonlar

| Şablon | Kategoriler | Örnek kanallar |
| --- | --- | --- |
| Topluluk | Başlangıç, Topluluk, Ses Kanalları | hos-geldin, kurallar, duyurular, sohbet, tanisma, sorular, Sohbet Odasi |
| Oyun | Başlangıç, Oyun, Ses Kanalları | hos-geldin, kurallar, duyurular, sohbet, takim-arkadasi, klipler, Takım Odası |
| Eğitim | Başlangıç, Ders Çalışma, Ses Kanalları | hos-geldin, kurallar, duyurular, ders-odasi, sorular, kaynaklar, Sessiz Çalışma |

Sihirbaz boş kanallar oluşturur. Sunucu kurallarını yazmaz, karşılama mesajı göndermez, rol oluşturmaz, kanal izinlerini değiştirmez, üye davet etmez ve Discord’un karşılama ayarlarına dokunmaz. Yeni kanallar sunucunun olağan izinlerini kullanır. Üyeleri davet etmeden önce sunucunuzun rol ve kanal izinlerini gözden geçirin.

## Gerekenler

- Node.js 24.17 veya üzeri. Sabitlenen discord.js 14.27.0 sürümü bu gereksinimi belirtiyor; [discord.js belgelerine](https://discord.js.org/docs/packages/discord.js/14.27.0) bakın.
- [Discord Developer Portal](https://discord.com/developers/applications) içinde uygulama oluşturabilen bir Discord hesabı.
- Uygulamayı ekleyebileceğiniz ve kanalları yönetebileceğiniz bir Discord sunucusu.
- Bir Node.js sürecini çalışır durumda tutabilecek bilgisayar veya barındırma hizmeti.

Botun çalıştığı terminali kapatır veya bilgisayarı kapatırsanız ServerSage çevrimdışı olur. Önceden oluşturduğu sunucu kanalları Discord’da kalır.

## Discord botunu oluşturup sunucuya ekleme

1. [Discord Developer Portal](https://discord.com/developers/applications) sayfasını açıp **New Application** düğmesine basın.
2. Uygulamaya ServerSage gibi bir ad verip oluşturun.
3. Sol menüden **Bot** sayfasını açın. Portal isterse bot kullanıcısını oluşturun.
4. Bot sayfasında **Reset Token** veya **Copy Token** seçeneğini kullanın. Token’ı gizli tutun; bu değere sahip olan kişi botunuzu yönetebilir.
5. **OAuth2 → URL Generator** bölümünü açın. **bot** ve **applications.commands** kapsamlarını seçin.
6. Bot izinlerinden yalnızca **View Channels** ve **Manage Channels** seçeneklerini işaretleyin. ServerSage’in Administrator, Manage Roles veya mesaj içeriğine erişim iznine ihtiyacı yoktur.
7. Oluşturulan bağlantıyı kopyalayıp tarayıcıda açın, sunucunuzu seçin ve kurulumu onaylayın.

Uygulama kurulumu ve sunucu izinlerini Discord yönetir. Discord’un [slash komut rehberi](https://docs.discord.com/developers/docs/interactions/slash-commands) ve [izinler belgesini](https://discord.com/developers/docs/topics/permissions) inceleyebilirsiniz.

## Windows’ta kod yazmadan çalıştırma

Bu adımlarda projeyle gelen kurulum dosyalarını kullanabilirsiniz. Git veya kaynak kod düzenleyicisi gerekmez.

1. GitHub sayfasında **Code → Download ZIP** seçeneğine basın ve ZIP dosyasını çıkarın. Açılan ServerSage klasörünü bulabileceğiniz bir yere koyun.
2. [nodejs.org](https://nodejs.org/en/download) adresinden Node.js 24.17 veya üzerini kurun. Daha eski bir sürüm varsa devam etmeden önce güncelleyin.
3. ServerSage klasörünü açıp **setup-windows.cmd** dosyasına çift tıklayın. Siyah kurulum penceresi gerekli paketleri kurar ve gizli bir .env ayar dosyası oluşturur.
4. Aynı klasördeki .env dosyasını Not Defteri ile açın. Windows hangi uygulamayı kullanacağını sorarsa Not Defteri’ni seçin. Şu değerleri girin:

       DISCORD_TOKEN=bot-tokeninizi-buraya-yapistirin
       DISCORD_CLIENT_ID=uygulama-numaraniz
       DISCORD_GUILD_ID=test-sunucunuzun-numarasi

   Uygulama numarasını **Developer Portal → General Information → Application ID** bölümünde bulabilirsiniz. Sunucu numarasını kopyalamak için **Discord Settings → Advanced → Developer Mode** seçeneğini açın, sonra sunucu simgesine sağ tıklayıp **Copy Server ID** seçin.

   Her satırda eşittir işaretinden sonraki değeri aynı satıra yazın. Tırnak işareti eklemeyin. Dosyayı .env adıyla kaydedin; .env.txt olmamalı. Token’ı kimseye göndermeyin ve ekran görüntüsünde paylaşmayın.

5. **register-windows.cmd** dosyasına çift tıklayın. Komut, DISCORD_GUILD_ID ile belirttiğiniz test sunucusuna kaydedilir. Sunucuya özel komutlar genellikle kısa sürede görünür.
6. **start-windows.cmd** dosyasına çift tıklayın. Bot çalışırken siyah pencereyi açık bırakın.
7. Sunucunuzda **/sunucu-kurulum** veya **/server-setup** komutunu çalıştırın. Şablon seçin, önizlemeyi inceleyin ve hazır olduğunuzda **Düzeni oluştur** düğmesine basın.
8. Botu durdurmak için siyah pencereye tıklayıp **Ctrl+C** tuşlarına basın.

Komutun botun kurulu olduğu tüm sunucularda görünmesi için DISCORD_GUILD_ID değerini boş bırakıp register-windows.cmd dosyasını yeniden çalıştırın. Genel komutların görünmesi daha uzun sürebilir. Kayıt betiği yalnızca ServerSage kurulum komutunu ekler; uygulamanızdaki diğer komutları silmez.

## Terminalden çalıştırma

Bu depoyu indirin veya klonlayın ve terminali klasörün içinde açın. .env.example dosyasını .env adıyla kopyalayıp yukarıda açıklanan değerleri girin.

    npm ci
    npm run commands:register
    npm start

Otomatik testleri Discord token’ı olmadan çalıştırabilirsiniz:

    npm run check
    npm audit --audit-level=high

macOS ve Linux kullanıcıları ayar dosyasını cp .env.example .env komutuyla kopyalayabilir. Süreci terminalde açık tutun veya yeniden başlatma desteği olan bir Node.js barındırıcısı kullanın. Her bot uygulaması için tek ServerSage süreci çalıştırın.

## Kurulum sihirbazını kullanma

1. Sihirbazı açmak için **Manage Server** iznine sahip olmanız gerekir. Bu, komutu kullanan kişinin iznidir; bota eklenen bir izin değildir.
2. Açılır listeden bir düzen seçin. ServerSage eklemeyi planladığı tüm kategorileri ve kanalları gösterir.
3. Önizlemeyi inceleyin. Bu aşamada sunucuda henüz değişiklik yapılmaz.
4. Onaylamak için **Düzeni oluştur** düğmesine basın. Başka bir şablon seçebilir veya işlemi iptal edebilirsiniz.
5. Sonuç mesajını okuyun. Mesaj; oluşturulanları, olduğu gibi bırakılanları ve Discord’un reddettiklerini listeler.

ServerSage düzeni oluşturmak için **Manage Channels**, var olan kanalları kontrol etmek için **View Channels** iznine ihtiyaç duyar. Bir izin eksikse sihirbaz yöneticinin neyi değiştirmesi gerektiğini açıklar. ServerSage Administrator istemez.

## Güvenli yeniden deneme

ServerSage kategorileri ada göre; kanalları ise ad, tür ve üst kategoriye göre eşleştirir. Eşleşen öğeleri olduğu gibi bırakır. Var olan kanalları yeniden adlandırmaz, taşımaz, sıralamaz, silmez, arşivlemez veya izinlerini değiştirmez.

Var olan bir kategoride özel izin kuralları varsa ServerSage o kategoriyi ve içindeki planlı kanalları atlar. Böylece yeni bir kanalın kategorideki gizlilik ayarlarını izlememesi riski önlenir. Önizleme bu bölümü güvenlik için atlanacak olarak işaretler.

Kanal izinleri botun bazı kanalları görmesini engelleyebilir. Bu gizli alanlar önizlemede bulunmayabilir; aynı adlı gizli bir kategori bu durumda yeniden oluşturulabilir. Sunucunuzda özel kategoriler varsa botun düzeni kontrol etmesini istediğiniz yerlerde ona Kanalları Görüntüle izni verin veya önizlemeyi dikkatlice inceleyip bu alanlarda şablonu uygulamayın.

Discord bazı kanalları oluşturup başka bir kanalı reddedebilir. ServerSage hataları bildirir ve tamamlanan öğeleri bırakır. İzin veya Discord tarafındaki sorunu çözdükten sonra aynı şablonu yeniden çalıştırın; oluşturulmuş öğeler atlanır.

## Gizlilik

- Bot yalnızca Guilds Gateway intent’ine abone olur. Message Content, Guild Members ve Presence intent’leri etkin değildir.
- ServerSage mesajları, üye listelerini veya konuşma dökümlerini okumaz ya da saklamaz.
- Bot veritabanı kullanmaz ve sunucu bilgilerini ayrı bir analiz hizmetine göndermez.
- Bot token’ı yerel .env dosyanızda veya barındırma hizmetinizin gizli ortam ayarlarında kalır. .env Git tarafından yok sayılır.
- Düzeni kurmak için gereken standart kanal oluşturma istekleri Discord’a gönderilir. Oluşturulan kanalları Discord kendi hizmetinde saklar.

## Sorun giderme

| Ekrandaki mesaj | Ne yapmalı? |
| --- | --- |
| “Node.js was not found” | Node.js 24.17 veya üzerini kurun, kurulum penceresini kapatın ve yeniden açın. |
| “DISCORD_TOKEN is missing” | .env dosyasını açın, DISCORD_TOKEN= sonrasına bot token’ını yapıştırıp kaydedin ve yeniden başlatın. |
| “401: Unauthorized” veya giriş başarısız | Developer Portal’daki Bot sayfasından token’ı sıfırlayın, .env içindeki eski değeri değiştirin ve botu yeniden başlatın. Token’ı herkese açık bir sorunda paylaşmayın. |
| Slash komutu görünmüyor | register-windows.cmd dosyasını yeniden çalıştırın. Token ve uygulama numarasının aynı uygulamaya ait olduğunu, botun applications.commands kapsamıyla eklendiğini kontrol edin. |
| “Manage Server” mesajı | Komutu kullanan kişinin sunucuda Manage Server izni olmalı. |
| “Manage Channels” mesajı | Yönetici bota Manage Channels izni vermeli. Var olan düzenin kontrolü için View Channels iznini de açık bırakın. |
| Bot çevrimdışı oluyor | Bilgisayar veya barındırma süreci durmuş olabilir. start-windows.cmd ile yeniden başlatın. Sürekli çevrimiçi kalması için Node.js sürecini açık tutan bir barındırıcı kullanın. |
| Bazı kanallar açıldı, bazıları açılamadı | Sonuç listesini okuyun, belirtilen izin veya Discord sorununu çözün ve aynı şablonu tekrar çalıştırın. Var olan öğeler atlanır. |

Sorun sürerse hata kodu ve tekrar oluşturma adımlarıyla GitHub’da bir sorun açın. Ekran görüntülerinden ve kayıtlardan token, sunucu numarası ve özel bilgileri çıkarın.

## Geliştirme ve testler

Bağımlılıkları npm ci ile kurun ve npm run check komutunu çalıştırın. Testler şablonları, önizleme ve onay akışını, kullanıcı ve izin kontrollerini, güvenli yeniden denemeyi, eşzamanlı istekleri ve Discord API hatalarını kapsar. Testler sahte kanallarla çalışır; gerçek Discord sunucusuna bağlanmaz.

GitHub Actions aynı kontrolleri push ve pull request işlemlerinde çalıştırır. Bağımlılık denetimi npm audit ile yüksek önem seviyesinde yapılır.

## Lisans

ServerSage MIT Lisansı ile yayımlanmıştır. [LICENSE](LICENSE) dosyasına bakın.
