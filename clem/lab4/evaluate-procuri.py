#medie documente generate
# Average structura: 6.94
# Average limbaj: 7.94
# Average respectare_scop: 6.63
#Total: 7.17
import json

path = f"C:\\Users\\Omen\\Desktop\\Facultate\\An 3\\Sem I\\MIRPR\\results.jsonl"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

sum_structura = 0
sum_limbaj = 0
sum_respectare_scop = 0
count = 0

for item in data:
    eval_field = item.get("evaluare")
    if eval_field:
        sum_structura += eval_field.get("structura", 0)
        sum_limbaj += eval_field.get("limbaj", 0)
        sum_respectare_scop += eval_field.get("respectare_scop", 0)
        count += 1

mean_structura = sum_structura / count if count else 0
mean_limbaj = sum_limbaj / count if count else 0
mean_respectare_scop = sum_respectare_scop / count if count else 0

print("Average structura:", mean_structura)
print("Average limbaj:", mean_limbaj)
print("Average respectare_scop:", mean_respectare_scop)


