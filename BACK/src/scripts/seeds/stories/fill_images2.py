import json
import requests
import time
import os
import sys

# ================= CONFIGURATION =================
UNSPLASH_ACCESS_KEY = "m_LXTEozi6HVQQ5LSbQU7aThgfrmHwvVB7RUSp4sEnk"
INPUT_FILENAME = "stories_input2.json"
OUTPUT_FILENAME = "stories_fixed2.json"
# =================================================

def search_unsplash(query):
    """
    Recherche une image et gère explicitement la limite d'API.
    Retourne:
      - L'URL optimisée (str)
      - "LIMIT_REACHED" (str)
      - None (si rien trouvé)
    """
    url = "https://api.unsplash.com/search/photos"
    headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape",
        "content_filter": "high"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        
        # 🚨 DÉTECTION IMMÉDIATE DE LA LIMITE
        if response.status_code == 403:
            return "LIMIT_REACHED"

        if response.status_code == 200:
            data = response.json()
            if data['results']:
                # Récupération de l'URL RAW
                raw_url = data['results'][0]['urls']['raw']
                # Optimisation pour mobile (Largeur 800px, Qualité 60%, Format WebP/JPG auto)
                optimized_url = f"{raw_url}&w=400&q=60&auto=format&fit=crop"
                return optimized_url
                
    except Exception as e:
        print(f"⚠️ Erreur réseau : {e}")
        pass
    
    return None

def get_smart_image(keywords, context_backup):
    """Stratégie en entonnoir avec arrêt immédiat si limite atteinte"""
    
    # Nettoyage
    stopwords = ["background", "view", "panoramic", "aerial", "scene", "detailed", "realistic", "collage", "illustration"]
    clean_keywords = ' '.join([word for word in keywords.split() if word.lower() not in stopwords])

    # TENTATIVE 1 : Précise
    print(f"   🔹 T1: '{clean_keywords}'", end="... ")
    url = search_unsplash(clean_keywords)
    if url == "LIMIT_REACHED": return "LIMIT_REACHED"
    if url: 
        print("✅")
        return url
    print("❌")

    # TENTATIVE 2 : Simplifiée (2 premiers mots)
    simplified = " ".join(clean_keywords.split()[:2])
    print(f"   🔸 T2: '{simplified}'", end="... ")
    url = search_unsplash(simplified)
    if url == "LIMIT_REACHED": return "LIMIT_REACHED"
    if url: 
        print("✅")
        return url
    print("❌")

    # TENTATIVE 3 : Backup (Contexte)
    print(f"   🔻 T3 (Backup): '{context_backup}'", end="... ")
    url = search_unsplash(context_backup)
    if url == "LIMIT_REACHED": return "LIMIT_REACHED"
    if url: 
        print("✅")
        return url
    print("❌")

    return None

def process_stories():
    if not os.path.exists(INPUT_FILENAME):
        print(f"Erreur : '{INPUT_FILENAME}' introuvable.")
        return

    with open(INPUT_FILENAME, 'r', encoding='utf-8') as f:
        stories = json.load(f)

    limit_hit = False
    count = 0

    print("🚀 Démarrage... (Faites Ctrl+C pour arrêter et sauvegarder à tout moment)")

    try:
        for story in stories:
            if limit_hit: break
            
            # Contexte de secours (ex: "AO Malanje landscape")
            context_backup = f" {story.get('city', '')} landscape"
            
            print(f"\n🌍 Story : {story.get('title')}")

            for item in story.get('timeline', []):
                if limit_hit: break

                # On traite si pas d'image MAIS qu'on a des mots clés
                if not item.get('imageUri') and item.get('imageKeywords'):
                    
                    # print(f"\n🌍 Story : {story.get('title')} miss")
                    # Appel de la fonction intelligente
                    result = get_smart_image(item['imageKeywords'], context_backup)

                    if result == "LIMIT_REACHED":
                        print("\n🛑 LIMITE API ATTEINTE (50/50). Arrêt et sauvegarde...")
                        limit_hit = True
                        break
                    
                    if result:
                        item['imageUri'] = result
                        count += 1
                    
                    # Pause pour ne pas spammer l'API
                    time.sleep(1)

    except KeyboardInterrupt:
        print("\n\n✋ Interruption manuelle (Ctrl+C) détectée !")
        print("Sauvegarde des données traitées en cours...")

    # SAUVEGARDE FINALE (S'exécute toujours, même après Ctrl+C ou erreur)
    print(f"\n💾 Sauvegarde dans '{OUTPUT_FILENAME}'...")
    with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
        json.dump(stories, f, indent=4, ensure_ascii=False)

    print(f"✨ Terminé ! {count} images ajoutées/mises à jour.")
    if limit_hit:
        print("💡 Conseil : Attendez 1 heure avant de relancer le script pour la suite.")

if __name__ == "__main__":
    process_stories()